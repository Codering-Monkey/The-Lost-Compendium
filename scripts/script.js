import colours from "../colour.json" with { type: 'json' };
import tooltip from "../tooltip.json" with { type: 'json' };
import base_monsters from "../data/monsters.json" with { type: 'json' }
import { renderItem } from "../scripts/info.js";

sessionStorage.setItem("tooltip", JSON.stringify(tooltip))

export function inject(old_data, injection_path) {
	let saved = JSON.parse(localStorage.getItem("Saved"));
	if (saved) {
		if (injection_path in saved) {
			return inject_iterate(saved[injection_path], old_data)
		} else {
			return old_data
		}
	} else {
		return old_data
	}
}

function inject_iterate(list_of_items, old_data) {
	if (Array.isArray(old_data)) {
		for (let i = 0; i < list_of_items.length; i++) {
			let current_item = list_of_items[i]
			let item_included = false
			let index = 0
			for (let j = 0; j < old_data.length; j++) {
				if (current_item['Name'] === old_data[j]["Name"]) {
					item_included = true
					break
				}
				index++
			}
			if (item_included) {
				if ("SubItems" in current_item) {
					old_data[index]["SubItems"] = inject_iterate(current_item["SubItems"], old_data[index]["SubItems"])
				}
			} else {
				old_data[old_data.length] = current_item
			}
		}
	} else {
		Object.entries(list_of_items[0]).forEach(([key, value]) => {
			old_data[key] = value
		})
	}
	return old_data
}

export function IdGet(Object_ID) {
	return document.getElementById(Object_ID)
}

export function diceCalc(amount, size, bonus=0, multiplier=1) {
	let final = parseInt(bonus)
	for (let i = 0; i < parseInt(amount); i++) {
		final = parseInt(final) + Math.ceil(Math.random() * parseInt(size))
	}
	return final * multiplier
}

export function createOverlay(plain=false, createEvent=true, returnBoth=false) {
	let overlay = document.createElement("div")
	overlay.classList.add("overlay")
	overlay.id = "overlay"
	if (createEvent) {
		overlay.addEventListener("click", function(event) {if (event.target.id == "overlay") {this.remove()}})
	}
	document.body.appendChild(overlay)
	if (plain) {
		return overlay
	} else {
		let box = document.createElement("div")
		box.classList.add("overlay-box")
		overlay.appendChild(box)
		if (returnBoth) {
			return [box, overlay]
		} else {
			return box
		}
	}
}

export function setColours() {
	Object.entries(colours[localStorage.getItem("Colour")]).forEach(([key, value]) => {
		document.querySelector(':root').style.setProperty(key, value);
	})
}

export function redirect(location) {
	window.location.href = location
}

export function getJSON(name, type="session") {
    let storedData
    if (type === "local") {
        storedData = localStorage.getItem(name)
    } else {
        storedData = sessionStorage.getItem(name)
    }
	return JSON.parse(storedData)
}

export function setJSON(name, data, type="session") {
    let storedData = JSON.stringify(data)
    if (type === "local") {
        localStorage.setItem(name, storedData)
    } else {
        sessionStorage.setItem(name, storedData)
    }
	sessionStorage.setItem(name, JSON.stringify(data))
}

export function appendJSON(name, newData, type="session", appendAsIs=false) {
    const data = getJSON(name, type)
    if (Array.isArray(newData) && !appendAsIs) {
        for (let i = 0; i < newData.length; i++) {
            data.push(newData[i])
        }
    } else {
        data.push(newData)
    }
    setJSON(name, data, type)
}

export function foundIn(key, string, deepSearch=false) {
	key = key.toLowerCase()
	if (Array.isArray(string)) {
		for (let i = 0; i < string.length; i++) {
			let testString
			try {
				testString = string[i].toLowerCase()
			} catch {
				testString = string[i]
			}
			if (key == testString) {
				return true
			} else if (deepSearch) {
				if (Array.isArray(testString)) {
					if (foundIn(key, testString, true)) {
						return true
					}
				} else {
					if (foundIn(key, testString, false)) {
						return true
					}
				}
			}
		}
	} else {
		string = string.toLowerCase()
		for (let i = 0; i < string.length; i++) {
			if (string[i] == key[0]) {
				const result = possibleFind(key, string, i)
				if (result) {
					return true
				}
			}
		}
	}
	return false
}

function possibleFind(key, string, i) {
	for (let j = 1; j < key.length; j++) {
		if (key[j] != string[i+j]) {
			return false
		}
	}
	return true
}

export function getMonster(monsters, minCR, maxCR, type, size) {
	let final = []
	Object.entries(monsters).forEach(([key, value]) => {
		if ((((value["CR"] >= minCR) || (minCR == "All")) && ((value["CR"] <= maxCR) || (maxCR == "All"))) && ((value["Type"] == type) || (type == "All")) && ((value["Size"] == size) || (size == "All"))) {
			final = final.concat(key)
		}
	})
	return final
}

export function forceSymbol(number) {
	if (parseInt(number) < 0 && String(number)[0] != "-") {
		return "-" + number
	} else if (parseInt(number) > 0 && String(number)[0] != "+") {
		return "+" + number
	} else {
		return number
	}
}

export function checkUnit(feet, returnUnit=true) {
	if (localStorage.getItem("unit") == "m") {
		if (returnUnit) {
			return ((feet / 5) * 1.5) + " m"
		} else {
			return ((feet / 5) * 1.5)
		}
	} else {
		if (returnUnit) {
			return feet + " ft"
		} else {
			return feet
		}
	}
}

export function flattenNum(number) {
	if (parseInt(number) != parseFloat(number)) {
		let prefix = parseInt(number)
		if (prefix == 0) {
			prefix = ""
		}
		return prefix + " 1 / " + (1 / number) 
	} else {
		return parseInt(number)
	}
}

export function lineBreak(parent, amount=1) {
	for (let i=0; i < amount; i++) {
		parent.appendChild(document.createElement("br"))	
	}
}

export function sortDict(dictionary) {
	let names = []
	Object.keys(dictionary).forEach((key) => {
		names.push(key)
	})
	names.sort()
	let newDict = {}
	for (let i = 0; i < names.length; i++) {
		newDict[names[i]] = dictionary[names[i]]
	}
	return newDict
}

export function arrayDelete(array, index) {
    const start =  array.slice(0, index)
    const end = array.slice(index+1, array.length)   
    for (let k = 0; k < end.length; k++) {
        start.push(end[k])
    }    
    return start
}

export function arrayToString(array) {
	let string = ""
	for (let i = 0; i < array.length; i++) {
		string += array[i]
	}
	return string
}

export function capitalise(string, allWords=false) {
	let stringWords
	if (allWords) {
		stringWords = string.split(" ")
	} else {
		stringWords = [string]
	}
	for (let i = 0; i < stringWords.length; i++) {
		stringWords[i] = stringWords[i][0].toUpperCase() + stringWords[i].slice(1)
        if (i < stringWords.length - 1) {
            stringWords[i] += " "
        }
	}
	return arrayToString(stringWords)
}

export function allSame(array) {
	const key = array[0]
	for (let i = 1; i < array.length; i++) {
		if (array[i] != key) {
			return false
		}
	}
	return true
}

export function clear(parent, keep=0) {
	while (parent.childNodes.length > keep) {
		parent.removeChild(parent.lastChild)
	}
}

export function mergeArray(array) {
	let message = ""
	for (let j = 0; j < array.length; j++) {
		if (j == array.length - 1) {message += array[j]}
		else if (j == array.length - 2) {message += array[j]+ " and "}
		else {message += array[j] + ", "}
	}
	return message
}

export function renderText(string) {
	string = String(string)
	let tooltip = JSON.parse(sessionStorage.getItem("tooltip"))
	string = string
				.replaceAll("\n", "<br>")
				.replace(/\*\*(.*?)\*\*/gim, '<b>$1</b>')
				.replace(/\*(.*?)\*/gim, '<i>$1</i>');
	Object.entries(tooltip).forEach(([key, value]) => {
		string = string.replaceAll(key, "<span class='tooltip'>" + key + "<span class='tooltip-text'>" + value + "</span></span>")
		string = string.replaceAll(capitalise(key), "<span class='tooltip'>" + capitalise(key) + "<span class='tooltip-text'>" + value + "</span></span>")
	})
	string = string.replaceAll(" ft", "  ft")
	while (foundIn("  ft", string)) {
		let number = ""
		let index = string.indexOf("  ft") - 1
		while ((!(isNaN(string[index]))) || string[index] == "/") {
			number = string[index] + number
			index -= 1
		}
		if (foundIn("/", string)) {
			number += "  ft"
			number = number.replace(" ", "")
			let split = number.replace("  ft", "").split("/")
			string = string.replace(number, " " + checkUnit(split[0], false) + " / " + checkUnit(split[1]))
		} else {
			string = string.replace(number.replace(" ", "") + "  ft", " " + checkUnit(number))
		}
	}
	return string
}

export function monsterBar(clickCommand) {
    let monsters = sortDict(inject(base_monsters, "monsters"))

    const sorting_types = ["CR", "Type", "Size"]
    for (let i = 0; i < sorting_types.length; i++) {
        let selector = IdGet(sorting_types[i].toLowerCase() + "_options")
        selector.addEventListener("change", function() { loadScrollbox(monsters, clickCommand) })
    }
    loadScrollbox(monsters, clickCommand)
    return monsters
}

export function loadScrollbox(monsters, clickCommand) {
    let parameters = {}
    const sorting_types = ["CR", "Type", "Size"]
	for (let i = 0; i < sorting_types.length; i++) {
		let selector = IdGet(sorting_types[i].toLowerCase() + "_options")
		parameters[sorting_types[i]] = selector.value
	}
	let parent = IdGet("monster_scroll")
	while (parent.firstChild) {
		parent.removeChild(parent.lastChild);
	}
	let valid_monsters = getMonster(monsters, parameters["CR"], parameters["CR"], parameters["Type"], parameters["Size"])
	for (let i = 0; i < valid_monsters.length; i++) {
		renderItem(parent, valid_monsters[i], 1, "", valid_monsters[i], function() { clickCommand(valid_monsters[i]) })
	}
}

export function searchParam() {
    const searchLink = window.location.search.substring(1).split("&")
    let searchDict = {}
    for (let i = 0; i < searchLink.length; i++) {
        let parameter = searchLink[i].split("=")
        searchDict[parameter[0]] = parameter[1]
    }
    return searchDict
}