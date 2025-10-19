import base_spells from "../data/spells.json" with { type: 'json' }
import { IdGet, forceSymbol, checkUnit, flattenNum, foundIn, sortDict, inject, lineBreak, mergeArray } from "../scripts/script.js"

let spells = sortDict(inject(base_spells, "spells"))

let unit_switch = IdGet("units")
unit_switch.addEventListener("click", function() {
	if (unit_switch.firstChild.getAttribute("state") == "on") {
		unit_switch.firstChild.setAttribute("state", "off")
		unit_switch.firstChild.textContent = "ft"
		localStorage.setItem("unit", "ft")
	} else {
		unit_switch.firstChild.setAttribute("state", "on")
		unit_switch.firstChild.textContent = "m"
		localStorage.setItem("unit", "m")
	}
	loadSpell()
})
if (localStorage.getItem("unit") == "m") {
	unit_switch.firstChild.setAttribute("state", "on")
	unit_switch.firstChild.textContent = "m"
}

function loadSpell() {
	const selected_spell = spells[(window.location.hash).replaceAll("#", "").replaceAll("%20", " ")]
	document.title = "The Lost Compendium - " + selected_spell["Name"]
	IdGet("name").textContent = selected_spell["Name"]
	let classMessage = "(" + mergeArray(selected_spell["Classes"]) + ")"
	let lscMessage
	if (selected_spell["Level"] == 0) {
		lscMessage = selected_spell["School"] + " Cantrip " + classMessage
	} else {
		lscMessage = "Level " + selected_spell["Level"] + " " + selected_spell["School"] + " " + classMessage
	}
	IdGet("lsc").textContent = lscMessage
	IdGet("cast").textContent = selected_spell["Casting Time"]
	IdGet("range").textContent = checkUnit(selected_spell["Range"])
	IdGet("component").textContent = mergeArray(selected_spell["Components"])
	IdGet("duration").textContent = selected_spell["Duration"]
	let description = selected_spell["Description"]
	description = description.replaceAll(" ft", "  ft")
	while (foundIn("  ft", description)) {
		let number = ""
		let index = description.indexOf("  ft") - 1
		while ((!(isNaN(description[index]))) || description[index] == "/") {
			number = description[index] + number
			index -= 1
		}
		if (foundIn("/", description)) {
			number += "  ft"
			number = number.replace(" ", "")
			let split = number.replace("  ft", "").split("/")
			description = description.replace(number, " " + checkUnit(split[0], false) + " / " + checkUnit(split[1]))
		} else {
			description = description.replace(number.replace(" ", "") + "  ft", " " + checkUnit(number))
		}
	}
	IdGet("features").textContent = description
}

loadSpell()