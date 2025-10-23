import { IdGet, foundIn, sortDict, inject, allSame, capitalise, clear } from "../scripts/script.js"
import base_spells from "../data/spells.json" with { type: 'json' }

const spells = sortDict(inject(base_spells, "spells"))
sessionStorage.setItem("spells", JSON.stringify(spells))

const data_fields = ["name", "min_level", "max_level", "school", "min_range", "max_range", "bard", "cleric", "druid", "paladin", "ranger", "sorcerer", "warlock", "wizard"]
for (let i = 0; i < data_fields.length; i++) {
	IdGet(data_fields[i]).addEventListener("change", function() { findSpells() })
}
findSpells()

function findSpells() {
	let validSpells = JSON.parse(sessionStorage.getItem("spells"))
	let text = IdGet("name").value
	if (text) {
		Object.entries(validSpells).forEach(([key, value]) => {
			if (!foundIn(text, value["Name"])) {
				delete validSpells[key]
			}
		}) 
	}
	let min_level = IdGet("min_level").value
	let max_level = IdGet("max_level").value
	if (min_level == "All") {
		min_level = 0
	}
	if (max_level == "All") {
		max_level = 9
	}
	Object.entries(validSpells).forEach(([key, value]) => {
		if (!(value["Level"] >= min_level && value["Level"] <= max_level)) {
			delete validSpells[key]
		}
	})
	const school = IdGet("school").value
	if (school != "All") {
		Object.entries(validSpells).forEach(([key, value]) => {
			if (value["School"] != school) {
				delete validSpells[key]
			}
		})
	}
	let min_range = IdGet("min_range").value
	let max_range = IdGet("max_range").value
	if (min_range != "All" && min_range != "All") {
		if (min_range == "All") {
			min_range = -1
		} else if (min_range == "Self") {
			min_range = -1
		} else if (min_range == "Touch") {
			min_range = 0
		}
		if (max_range == "All") {
			max_range = 42690
		} else if (max_range == "Self") {
			max_range = -1
		} else if (max_range == "Touch") {
			max_range = 0
		}
		Object.entries(validSpells).forEach(([key, value]) => {
			let range = value["Range"]
			if (range == "Self") {
				range = -1
			} else if (range == "Touch") {
				range = 0
			} else {
				try {
					range = parseInt(range)
				} catch {
					range = 42690
				}
			}
			if (!(range >= min_range && range <= max_range)) {
				delete validSpells[key]
			}
		})
	}
	const classes = ["bard", "cleric", "druid", "paladin", "ranger", "sorcerer", "warlock", "wizard"]
	let validClasses = []
	const key = IdGet("bard").checked
	let allSame = true
	for (let i = 0; i < classes.length; i++) {
		const checked = IdGet(classes[i]).checked
		if (checked) {
			validClasses.push(classes[i])
		}
		if (checked != key) {
			allSame = false
		}
	}
	if (!allSame) {
		Object.entries(validSpells).forEach(([key, value]) => {
			let spellIsValid = false
			for (let i = 0; i < validClasses.length; i++) {
				if (value["Classes"].includes(capitalise(validClasses[i]))) {
					spellIsValid = true
					break
				}
			}
			if (!spellIsValid) {
				delete validSpells[key]
			}
		})
	}
	let parent = IdGet("spell_box")
	clear(parent, 4)
	Object.entries(validSpells).forEach(([key, value]) => {
		let row = document.createElement("div")
		row.addEventListener("click", function() {window.location.href = "spell.html?spell=" + value["Name"]} )
		row.classList.add("monster-row-short")
		
		const data_types = ["Name", "Level", "School"]
		for (let i = 0; i < data_types.length; i++) {
			let text = document.createElement("div")
			if (data_types[i] == "Level") {
				if (value[data_types[i]] == "0") {
					text.textContent = "Cantrip"
				} else {
					text.textContent = value[data_types[i]]
				}
			} else {
				text.textContent = value[data_types[i]]	
			}
			row.appendChild(text)
		}
		
		let text = document.createElement("div")
		let spell_text = ""
		for (let j = 0; j < value["Classes"].length; j++) {
			if (j == value["Classes"].length - 1) {spell_text += value["Classes"][j]}
			else if (j == value["Classes"].length - 2) {spell_text += value["Classes"][j]+ " and "}
			else {spell_text += value["Classes"][j] + ", "}
		}
		if (value["Classes"].length > 3) {
			let scroll = document.createElement("div")
			scroll.classList.add("scrolling-text")
			scroll.style.width = (value["Classes"].length * 55) + "px";
			scroll.textContent = spell_text
			scroll.style.animationDuration = "5s"
			text.appendChild(scroll)
		} else {
			text.textContent = spell_text
		}
		row.appendChild(text)
		
		parent.appendChild(row)
	})
}