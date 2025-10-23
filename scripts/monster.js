import base_monsters from "../data/monsters.json" with { type: 'json' }
import { IdGet, forceSymbol, checkUnit, flattenNum, foundIn, sortDict, inject, lineBreak } from "../scripts/script.js"

let monsters = sortDict(inject(base_monsters, "monsters"))

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
	loadMonster()
})
if (localStorage.getItem("unit") == "m") {
	unit_switch.firstChild.setAttribute("state", "on")
	unit_switch.firstChild.textContent = "m"
}

function loadMonster() {
	const substring = window.location.search.substring(1).split('=')
	if (substring[0] == "monster") {
		const info_source = substring[1].replaceAll("%20", " ")
	} else {
		alert("An Error Occured, Please specify a monster query")
	}
	const selected_monster = monsters[info_source]
	IdGet("name").textContent = selected_monster["Name"]
	document.title = "The Lost Compendium - " + selected_monster["Name"]
	let sta = ""
	if (selected_monster["Size"].length > 1) { sta += selected_monster["Size"][0] + " or " + selected_monster["Size"][1] }
		else { sta += selected_monster["Size"][0] }
	sta += " " + selected_monster["Type"] + ", " + selected_monster["Alignment"]
	IdGet("sta").textContent = sta
	IdGet("ac").textContent = selected_monster["Armour"]
	IdGet("init").textContent = forceSymbol(selected_monster["Initiative"]) + " (" + (10 + parseInt(selected_monster["Initiative"])) + ")"
	IdGet('hp').textContent = 
		Math.floor(parseInt(selected_monster["HP"][0]) * (parseInt(selected_monster["HP"][1] + 0.5)) + parseInt(selected_monster["HP"][2])) 
		+ " (" + selected_monster["HP"][0] + "d" + selected_monster["HP"][1] + " + " + selected_monster["HP"][2] + ")"
	
	let speed = checkUnit(selected_monster["Speed"]["Walk"]) + ". "
	Object.entries(selected_monster["Speed"]).forEach(([key, value]) => {
		if (key != "Walk") {
			speed += key + " " + checkUnit(value) + ". "
		}
	})
	IdGet("speed").textContent = speed
	let stat_arr = [["Stat", "Score", "Mod", "Save"]]
	Object.entries(selected_monster["Stats"]).forEach(([key, value]) => {
		stat_arr.push([key, value[0], value[1], value[2]])
	})
	
	let table = IdGet("stats")
	while (table.firstChild) {
		table.removeChild(table.lastChild)
	}
	let minor_name = "th"
	for (let i = 0; i < 4; i++) {
		let row = document.createElement("tr")
		for (let j = 0; j < 7; j++) {
			let item = document.createElement(minor_name)
			item.textContent = stat_arr[j][i]
			row.appendChild(item)
		}
		minor_name = "td"
		table.appendChild(row)
	}
	
	if ("Skills" in selected_monster) {
		let skill_text = ""
		Object.entries(selected_monster["Skills"]).forEach(([key, value]) => {
				skill_text += key + " " + forceSymbol(value) + ","
		})
		IdGet("skill").textContent = skill_text.slice(0, -1)
	} else {
		IdGet("skill_div").style.display = "none"
	}
	
	let sense_text = ""
	Object.entries(selected_monster["Senses"]).forEach(([key, value]) => {
		if (key == "Passive perception") {
			sense_text += "Passive perception " + value
		} else {
			sense_text += key + " " + checkUnit(value) + "; "
		}
	})
	IdGet("sense").textContent = sense_text
	
	let lang_text = ""
	Object.entries(selected_monster["Languages"]).forEach(([key, value]) => {
		if (parseInt(value) > 0) {
			lang_text += key + " " + checkUnit(value) + ", "
		} else {
			lang_text += key + ", "
		}
	})
	IdGet("lang").textContent = lang_text.slice(0, -2)
	
	IdGet("cr").textContent = flattenNum(selected_monster["CR"]) + " (XP " + selected_monster["XP"] + "; PB " + forceSymbol(selected_monster["PB"]) + ")"
	
	const damage_names = ["Vulnerabilities", "Resistances", "Immunities"]
	if ("Damage" in selected_monster) {
		for (let i = 0; i < damage_names.length; i++) {
			if (damage_names[i] in selected_monster["Damage"]) {
				let damage_text = "" 
				for (let j = 0; j < selected_monster["Damage"][damage_names[i]].length; j++) {
					damage_text += selected_monster["Damage"][damage_names[i]][j] + ", "
				}
				IdGet(damage_names[i]).textContent = damage_text.slice(0, -2)
			} else {
				IdGet(damage_names[i] + "_div").style.display = "none"
			}
		}	
	} else {
		for (let i = 0; i < damage_names.length; i++) {
			IdGet(damage_names[i] + "_div").style.display = "none"
		}
	}
	
	let features = IdGet("features")
	while (features.firstChild) {
		features.removeChild(features.lastChild)
	}
	Object.entries(selected_monster["Features"]).forEach(([key, value]) => {
		lineBreak(features)
		let header = document.createElement("h3")
		header.textContent = key
		features.appendChild(header)
		features.appendChild(document.createElement("hr"))
		Object.entries(value).forEach(([innerKey, innerValue]) => {
			let container = document.createElement("div")
			let title = document.createElement("strong")
			title.textContent = innerKey + ". "
			container.appendChild(title)
			innerValue = innerValue.replaceAll(" ft", "  ft")
			while (foundIn("  ft", innerValue)) {
				let number = ""
				let index = innerValue.indexOf("  ft") - 1
				while ((!(isNaN(innerValue[index]))) || innerValue[index] == "/") {
					number = innerValue[index] + number
					index -= 1
				}
				if (foundIn("/", innerValue)) {
					number += "  ft"
					number = number.replace(" ", "")
					let split = number.replace("  ft", "").split("/")
					innerValue = innerValue.replace(number, " " + checkUnit(split[0], false) + " / " + checkUnit(split[1]))
				} else {
					innerValue = innerValue.replace(number.replace(" ", "") + "  ft", " " + checkUnit(number))
				}
			}
			let text = document.createElement("t")
			text.textContent = innerValue
			container.appendChild(text)
			features.appendChild(container)
		})
	})
}

loadMonster()