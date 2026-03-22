
import re
import os

SURAH_EN = {
    1: "The Opening", 2: "The Throne Verse", 3: "The Family of Imran", 4: "The Women", 5: "The Table Spread",
    6: "The Cattle", 7: "The Heights", 8: "The Spoils of War", 9: "The Repentance", 10: "Jonah",
    11: "Hud", 12: "Joseph", 13: "The Thunder", 14: "Abraham", 15: "The Rocky Tract",
    16: "The Bee", 17: "The Night Journey", 18: "The Cave", 19: "Mary", 20: "Ta-Ha",
    21: "The Prophets", 22: "The Pilgrimage", 23: "The Believers", 24: "The Light", 25: "The Criterion",
    26: "The Poets", 27: "The Ants", 28: "The Stories", 29: "The Spider", 30: "The Romans",
    31: "Luqman", 32: "The Prostration", 33: "The Combined Forces", 34: "Sheba", 35: "The Originator",
    36: "Ya-Seen", 37: "Those who set the Ranks", 38: "The Letter Sad", 39: "The Troops", 40: "The Forgiver",
    41: "Explained in Detail", 42: "The Consultation", 43: "The Ornaments of Gold", 44: "The Smoke", 45: "The Crouching",
    46: "The Wind-Curved Sandhills", 47: "Muhammad", 48: "The Victory", 49: "The Rooms", 50: "The Letter Qaf",
    51: "The Winnowing Winds", 52: "The Mount", 53: "The Star", 54: "The Moon", 55: "The Beneficent",
    56: "The Inevitable", 57: "The Iron", 58: "The Pliving Woman", 59: "The Exile", 60: "She that is to be examined",
    61: "The Ranks", 62: "The Congregation", 63: "The Hypocrites", 64: "The Mutual Disillusion", 65: "The Divorce",
    66: "The Prohibition", 67: "The Sovereignty", 68: "The Pen", 69: "The Reality", 70: "The Ascending Stairways",
    71: "Noah", 72: "The Jinn", 73: "The Enshrouded One", 74: "The Cloaked One", 75: "The Resurrection",
    76: "The Human", 77: "The Emissaries", 78: "The Tidings", 79: "Those who drag forth", 80: "He Frowned",
    81: "The Overthrowing", 82: "The Cleaving", 83: "The Defrauding", 84: "The Sundering", 85: "The Mansions of the Stars",
    86: "The Night-Comer", 87: "The Most High", 88: "The Overwhelming", 89: "The Dawn", 90: "The City",
    91: "The Sun", 92: "The Night", 93: "The Morning Hours", 94: "The Relief", 95: "The Fig",
    96: "The Clot", 97: "The Power", 98: "The Clear Proof", 99: "The Earthquake", 100: "The Courser",
    101: "The Calamity", 102: "The Rivalry in world increase", 103: "The Declining Day", 104: "The Traducer", 105: "The Elephant",
    106: "Kuraish", 107: "Small Kindnesses", 108: "Abundance", 109: "The Disbelievers", 110: "The Help",
    111: "The Palm Fiber", 112: "The Sincerity", 113: "The Daybreak", 114: "Mankind"
}

path = "constants.ts"
with open(path, "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
current_id = None
ids_seen = set()

for line in lines:
    id_m = re.search(r'id:\s*(\d+),', line)
    if id_m:
        current_id = int(id_m.group(1))
    
    # Check if this line already has englishName or if we should add it
    if 'frenchName:' in line and current_id and current_id in SURAH_EN and 'englishName:' not in line:
        en_name = SURAH_EN[current_id]
        indent = line[:line.find('frenchName:')]
        new_lines.append(f'{indent}englishName: "{en_name}",')
    
    new_lines.append(line.rstrip('\n'))

with open(path, "w", encoding="utf-8") as f:
    f.write('\n'.join(new_lines))

print("Updated constants.ts with English surah names.")
