import re
from collections.abc import Mapping
from typing import Optional


_MAC_ADDRESS_PATTERN = re.compile(r"^[0-9a-fA-F]{12}$")


def normalize_device_id(device_id: object) -> str:
    """Normalize MAC-shaped device IDs without weakening opaque ID matching."""
    if not isinstance(device_id, str):
        return ""

    normalized = device_id.strip()
    compact = normalized.replace(":", "").replace("-", "")
    if _MAC_ADDRESS_PATTERN.fullmatch(compact):
        compact = compact.lower()
        return ":".join(compact[index : index + 2] for index in range(0, 12, 2))
    return normalized


class VisionDeviceBindings:
    """Explicitly authorize camera device IDs on behalf of controller IDs."""

    def __init__(self, raw_bindings: object = None):
        if raw_bindings is None:
            raw_bindings = {}
        if not isinstance(raw_bindings, Mapping):
            raise ValueError("server.vision_device_bindings 必须是主控ID到摄像头ID列表的映射")

        bindings: dict[str, frozenset[str]] = {}
        camera_owners: dict[str, str] = {}

        for raw_controller_id, raw_camera_ids in raw_bindings.items():
            controller_id = normalize_device_id(raw_controller_id)
            if not controller_id:
                raise ValueError("server.vision_device_bindings 包含空的主控设备ID")

            if isinstance(raw_camera_ids, str):
                camera_ids = [raw_camera_ids]
            elif isinstance(raw_camera_ids, (list, tuple, set, frozenset)):
                camera_ids = raw_camera_ids
            else:
                raise ValueError(f"主控设备 {controller_id} 的摄像头ID必须是字符串或列表")

            normalized_camera_ids: set[str] = set()
            for raw_camera_id in camera_ids:
                camera_id = normalize_device_id(raw_camera_id)
                if not camera_id:
                    raise ValueError(f"主控设备 {controller_id} 包含空的摄像头设备ID")
                if camera_id == controller_id:
                    continue

                existing_owner = camera_owners.get(camera_id)
                if existing_owner is not None and existing_owner != controller_id:
                    raise ValueError(
                        f"摄像头设备 {camera_id} 同时绑定到多个主控设备"
                    )
                camera_owners[camera_id] = controller_id
                normalized_camera_ids.add(camera_id)

            bindings[controller_id] = frozenset(normalized_camera_ids)

        self._bindings = bindings

    def resolve_controller_device_id(
        self, token_device_id: object, request_device_id: object
    ) -> Optional[str]:
        """Return the authenticated controller ID, or None when access is denied."""
        controller_id = normalize_device_id(token_device_id)
        uploader_id = normalize_device_id(request_device_id)
        if not controller_id or not uploader_id:
            return None
        if uploader_id == controller_id:
            return controller_id
        if uploader_id in self._bindings.get(controller_id, frozenset()):
            return controller_id
        return None
