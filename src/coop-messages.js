export const coopMessages={
  "error1": {
    "de": "Partie läuft bereits.",
    "en": "Match already started."
  },
  "error2": {
    "de": "Raum ist voll.",
    "en": "Room is full."
  },
  "error3": {
    "de": "Nur der Gastgeber kann das.",
    "en": "Only the host can do this."
  },
  "error4": {
    "de": "Partie läuft.",
    "en": "Match is running."
  },
  "error5": {
    "de": "Ungültiger Spieler.",
    "en": "Invalid player."
  },
  "error6": {
    "de": "Karte ungültig.",
    "en": "Invalid map."
  },
  "error7": {
    "de": "Schaffe Gras W40.",
    "en": "Complete wave 40 on The Green Chain."
  },
  "error8": {
    "de": "Alle müssen verbunden und bereit sein.",
    "en": "Everyone must be connected and ready."
  },
  "error9": {
    "de": "Emote bitte kurz warten.",
    "en": "Wait before sending another emote."
  },
  "error10": {
    "de": "Starte zuerst die Partie.",
    "en": "Start the match first."
  },
  "error11": {
    "de": "Ersten Turm platzieren.",
    "en": "Place your first tower."
  },
  "error12": {
    "de": "Welle nicht bereit.",
    "en": "Wave is not ready."
  },
  "error13": {
    "de": "Tempo ungültig.",
    "en": "Invalid speed."
  },
  "error14": {
    "de": "Schaffe W100 für ×8.",
    "en": "Complete wave 100 to unlock ×8."
  },
  "error15": {
    "de": "Schaffe W40 für ×5.",
    "en": "Complete wave 40 to unlock ×5."
  },
  "error16": {
    "de": "Partie noch nicht beendet.",
    "en": "The match has not ended."
  },
  "error17": {
    "de": "Kein Sieg zum Fortsetzen.",
    "en": "No victory to continue from."
  },
  "error18": {
    "de": "Partie beendet.",
    "en": "Match ended."
  },
  "error19": {
    "de": "Spende nicht möglich.",
    "en": "Donation unavailable."
  },
  "error20": {
    "de": "Unbekannter Befehl.",
    "en": "Unknown command."
  },
  "error21": {
    "de": "Dieser Turm gehört einem Mitspieler.",
    "en": "This tower belongs to another player."
  },
  "error22": {
    "de": "Turmlimit erreicht.",
    "en": "Tower limit reached."
  },
  "error23": {
    "de": "Nicht genug Credits.",
    "en": "Not enough credits."
  },
  "error24": {
    "de": "Hier kann kein Turm stehen.",
    "en": "You cannot build here."
  },
  "error25": {
    "de": "Nur JSON.",
    "en": "Only JSON messages are accepted."
  },
  "error26": {
    "de": "Ungültige Nachricht.",
    "en": "Invalid message."
  },
  "error27": {
    "de": "Alle Räume belegt.",
    "en": "All rooms are occupied."
  },
  "error28": {
    "de": "Raum nicht gefunden.",
    "en": "Room not found."
  },
  "error29": {
    "de": "Wiederbeitritt nicht möglich. Öffne einen neuen Raum.",
    "en": "Cannot reconnect. The room may have expired or this player is already connected."
  },
  "error30": {
    "de": "Zuerst Raum beitreten.",
    "en": "Join a room first."
  },
  "error31": {
    "de": "Befehlsnummer fehlt.",
    "en": "Command sequence missing."
  },
  "error32": {
    "de": "Alter Befehl.",
    "en": "Old command."
  },
  "error33": {
    "de": "Befehlsfolge unterbrochen. Bitte neu verbinden.",
    "en": "Command sequence interrupted. Please reconnect."
  },
  "error34": {
    "de": "Name: 1–20 sichtbare Zeichen, keine Steuerzeichen.",
    "en": "Name: 1–20 visible characters; no control characters."
  },
  "error35": {
    "de": "stopped",
    "en": "This match is stopped."
  },
  "error36": {
    "de": "missing",
    "en": "Tower not found."
  },
  "error37": {
    "de": "max",
    "en": "Fully upgraded."
  },
  "error38": {
    "de": "action",
    "en": "Invalid action."
  },
  "unknownError": {
    "de": "Die Aktion konnte nicht ausgeführt werden.",
    "en": "The action could not be completed."
  },
  "left": {
    "de": "{name} hat den Raum verlassen. Besitz an {heir}.",
    "en": "{name} left the room. Ownership transferred to {heir}."
  },
  "firstTower": {
    "de": "Setzt den ersten Turm. Dann beginnt Welle 1.",
    "en": "Place your first tower. Wave 1 starts next."
  },
  "restartLobby": {
    "de": "Zurück in der Lobby. Alle erneut bereit machen.",
    "en": "Back in the lobby. Everyone needs to get ready again."
  },
  "donated": {
    "de": "{name} spendet {amount} Credits an {to}.",
    "en": "{name} donates {amount} credits to {to}."
  },
  "usedDeal": {
    "de": "{name} nutzt den gemeinsamen Rabatt.",
    "en": "{name} uses the shared discount."
  },
  "disconnected": {
    "de": "{name} getrennt · {seconds} Sekunden für Wiederbeitritt.",
    "en": "{name} disconnected · {seconds} seconds to reconnect."
  },
  "saveFailed": {
    "de": "Koop-Spielstand konnte nicht gespeichert werden.",
    "en": "Could not save the co-op game."
  }
};
coopMessages.errorNeedTeam={de:'Koop benötigt mindestens zwei verbundene Spieler.',en:'Co-op needs at least two connected players.'};
export function errorCode(text){return Object.keys(coopMessages).find(k=>k.startsWith('error')&&coopMessages[k].de===text)||'unknownError';}
export function coopMessage(code,args={},lang='en'){return (coopMessages[code]?.[lang]||coopMessages.unknownError[lang]||coopMessages.unknownError.en).replace(/\{(\w+)\}/g,(_,key)=>String(args[key]??''));}
