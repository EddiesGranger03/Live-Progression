"""Framework-independent MVP rules. All intervals are half open."""
from datetime import datetime, timezone

XP_PER_QUEST = 20
UNDO_SECONDS = 600

def utc_now():
    return datetime.now(timezone.utc)

def parse_time(value: str) -> datetime:
    result = datetime.fromisoformat(value.replace('Z', '+00:00'))
    if result.tzinfo is None:
        raise ValueError('Thời điểm cần kèm múi giờ.')
    return result.astimezone(timezone.utc)

def overlaps(start, end, other_start, other_end):
    return start < other_end and other_start < end

def level_for(xp: int):
    return {'level': 1 + max(0, xp) // 200, 'current': max(0, xp) % 200, 'next': 200}

def available_windows(active_start, active_end, occupied, rest, buffer=5, minimum=15):
    """Input/output minutes since local midnight; rest is never suggested."""
    blocked = sorted([(max(active_start, a-buffer), min(active_end, b+buffer)) for a,b in occupied]
                     + [(max(active_start,a),min(active_end,b)) for a,b in rest])
    cursor = active_start
    windows = []
    for a,b in blocked:
        if b <= cursor or a >= active_end:
            continue
        if a-cursor >= minimum:
            windows.append((cursor,a))
        cursor = max(cursor,b)
    if active_end-cursor >= minimum:
        windows.append((cursor,active_end))
    return windows
