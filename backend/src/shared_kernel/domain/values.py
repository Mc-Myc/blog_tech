import re
from dataclasses import dataclass
from enum import StrEnum

_SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


@dataclass(frozen=True)
class Slug:
    value: str

    def __post_init__(self):
        if not _SLUG_RE.match(self.value):
            raise ValueError(f"slug invalide : {self.value!r}")


class Locale(StrEnum):
    FR = "fr"
    EN = "en"


@dataclass(frozen=True)
class MarkdownBody:
    text: str

    @property
    def word_count(self) -> int:
        return len(self.text.split())

    @property
    def reading_time_minutes(self) -> int:
        return max(1, round(self.word_count / 200))
