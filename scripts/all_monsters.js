import { IdGet, foundIn, getMonster, sortDict, inject } from "../scripts/script.js"
import base_monsters from "../data/monsters.json" with { type: 'json' }

let monsters = sortDict(inject(base_monsters, "monsters"))

const data_fields = ["name", "min_cr", "max_cr", "type", "size"]
for (let i = 0; i < data_fields.length; i++) {
	IdGet(data_fields[i]).addEventListener("change", function() { findMonsters() })
}
findMonsters()

function findMonsters() { 
	const data = {}
	let parent = IdGet("monster_box")
	while (parent.childNodes.length > 3) {
		parent.removeChild(parent.lastChild)
	}
	for (let i = 0; i < data_fields.length; i++) {
		data[data_fields[i]] = IdGet(data_fields[i]).value
	}
	const valid_monsters = getMonster(monsters, data["min_cr"], data["max_cr"], data["type"], data["size"])
	if (data["name"].trim() === "") {
		for (let i = 0; i < valid_monsters.length; i++) {
			generateMonster(parent, valid_monsters[i])
		}
	} else {
		for (let i = 0; i < valid_monsters.length; i++) {
			if (foundIn(data["name"], valid_monsters[i])) {
				generateMonster(parent, valid_monsters[i])
			}
		}
	}
}

function generateMonster(parent, name) {
	let row = document.createElement("div")
	row.addEventListener("click", function() {window.location.href = "monster.html?monster=" + name} )
	row.classList.add("monster-row-short")
	const data_types = ["Name", "CR", "Type"]
	const monster_data = monsters[name]
	for (let i = 0; i < data_types.length; i++) {
		let text = document.createElement("div")
		if (data_types[i] === "CR") {
			if ((parseFloat(monster_data[data_types[i]]) < 1) && (parseFloat(monster_data[data_types[i]]) !== 0.0)) {
				text.textContent = "1 / " + (1 / parseFloat(monster_data[data_types[i]]))	
			} else {
				text.textContent = monster_data[data_types[i]]
			}
		} else {
			text.textContent = monster_data[data_types[i]]	
		}
		row.appendChild(text)
	}
	let text = document.createElement("div")
	if (monster_data["Size"].length > 1) { text.textContent = monster_data["Size"][0] + " or " + monster_data["Size"][1] }
	else { text.textContent = monster_data["Size"][0] }
	row.appendChild(text)
	parent.appendChild(row)
}