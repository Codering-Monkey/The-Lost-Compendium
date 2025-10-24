import { IdGet, diceCalc, createOverlay, getJSON, setJSON, foundIn, lineBreak, arrayDelete, monsterBar } from "../scripts/script.js"

let monsters = monsterBar(function(param) { addPreMade(param) })

if (!sessionStorage.getItem("Init")) { setJSON("Init", []) }
loadOrder()

IdGet("reload_button").addEventListener("click", function() { loadOrder() });
IdGet("reset_button").addEventListener("click", function() { 
	let overlay = createOverlay()
	let question = document.createElement("h2")
	question.textContent = "Are you sure you want to wipe?"
	overlay.appendChild(question)
	let button = document.createElement("button")
	button.textContent = "Confirm"
	button.addEventListener("click", function() { setJSON("Init", []); loadOrder(); IdGet("overlay").remove() })
	overlay.appendChild(button)
})
IdGet("manual_button").addEventListener("click", function() { editOverlay()	})
IdGet("difficulty_button").addEventListener("click", function() {
	let overlay = createOverlay()
	
	let title = document.createElement("h2")
	title.textContent = "Difficulty"
	overlay.appendChild(title)
	
	const numbers_needed = ["Party Size", "Party Level"]
	let party = getJSON("Party")
	if (!party) {
		party = {"PartySize": 0, "PartyLevel": 0}
		setJSON("Party", party)
	}
	for (let i = 0; i < numbers_needed.length; i++) {
		let label = document.createElement("label")
		label.textContent = numbers_needed[i]
		overlay.appendChild(label)
		let input = document.createElement("input")
		input.type = "number"
		input.value = party[numbers_needed[i].replace(" ", "")]
		input.id = numbers_needed[i].replace(" ", "")
		overlay.appendChild(input)
		label.for = input
		input.addEventListener("change", function() {calculate()})
		lineBreak(overlay, 2)
	}
	
	let calculations = document.createElement("div")
	overlay.appendChild(calculations)
	
	function calculate() {
		let party = {"PartySize": IdGet("PartySize").value, "PartyLevel": IdGet("PartyLevel").value}
		setJSON("Party", party)
		while (calculations.firstChild) {
			calculations.removeChild(calculations.lastChild)
		}
		let totalXP = 0
		const initData = getJSON("Init")
		for (let i = 0; i < initData.length; i++) {
			totalXP += initData[i]["XP"]
		}
		const mediumEncounter = Math.ceil(((party["PartyLevel"]/10)*260.4148*party["PartyLevel"])/75)*75
		const thresholds = {
			"Trivial": (mediumEncounter * .5) * party["PartySize"], 
			"Easy": (mediumEncounter * .5) * party["PartySize"], 
			"Medium": (mediumEncounter * .75) * party["PartySize"], 
			"Hard": (mediumEncounter * 1.25) * party["PartySize"], 
			"Deadly": (mediumEncounter * 1.5) * party["PartySize"]
	    }
	
		let title = document.createElement("h3")
		title.style.color = "var(--contrast)"
		if (totalXP >= thresholds["Deadly"]) {
			title.textContent = "Deadly"
		} else if (totalXP >= thresholds["Hard"]) {
			title.textContent = "Hard"
		} else if (totalXP >= thresholds["Medium"]) {
			title.textContent = "Medium"
		} else if (totalXP >= thresholds["Easy"]) {
			title.textContent = "Easy"
		} else {
			title.textContent = "Trivial"
		}
		calculations.appendChild(title)
		
		lineBreak(calculations)
		
		let text = document.createElement("t")
		if (title.textContent === "Deadly") {
			text.textContent = "This encounter is Deadly because its total XP of " + totalXP + " sits above the party's Deadly threshold of " + thresholds["Deadly"] + " XP"
		} else if (title.textContent === "Trivial") {
			text.textContent = "This encounter is Trivial because its total XP of " + totalXP + " sits below the party's Easy threshold of " + thresholds["Easy"] + " XP"
		} else {
			const difficulties = ["Trivial", "Easy", "Medium", "Hard", "Deadly"]
			const harder = difficulties[difficulties.indexOf(title.textContent) + 1]
			const easier = difficulties[difficulties.indexOf(title.textContent) - 1]
			text.innerHTML = "This encounter is " + title.textContent + " because its total XP of " + totalXP + " sits above the party's " + easier + " threshold of " + thresholds[easier] + " XP,<br> but below the party's " + harder + " threshold of " + thresholds[harder] + " XP"
		}
		calculations.appendChild(text)
		
		console.log(mediumEncounter)
	}
	
	calculate()
})
										
function editOverlay(old_index=-1) {
	let overlay = createOverlay()
	let old_monster
	if (old_index > -1) {
		old_monster = getJSON("Init")[old_index]
	}
	let question = document.createElement("h2")
	question.textContent = "New Monster"
	overlay.appendChild(question)
	
	const statistics = ["Name", "Init", "AC"]
	for (let i = 0; i < statistics.length; i++) {
		let input = document.createElement("input")
		input.id = statistics[i] + "Input"
		if (old_index > -1) {
			input.value = old_monster[statistics[i]]
		}
		if (statistics[i] === "AC") {input.type = "number"}
		else {input.type = "text"}
		let label = document.createElement("label")
		label.textContent = statistics[i]
		overlay.appendChild(label)
		overlay.appendChild(input)
		label.setAttribute("for", statistics[i] + "Input")
		lineBreak(overlay, 2)
	}
	
	let hp_label = document.createElement("select")
	hp_label.style.margin = "8px"
	hp_label.style.float = "left"
	hp_label.textContent = "HP"
	hp_label.addEventListener("change", function() {
		let affected_id = ["d", "size", "+", "amount"]
		let new_value = "inline"
		if (this.value === "Static") {new_value = "none"}
		for (let i = 0; i < affected_id.length; i++) {
			IdGet(affected_id[i]).style.display = new_value
		}
	})
	overlay.appendChild(hp_label)
	
	let rolled = document.createElement("option")
	rolled.textContent = "Rolled"
	hp_label.appendChild(rolled)
	
	let constant = document.createElement("option")
	constant.textContent = "Static"
	hp_label.appendChild(constant)
	
	let hp_values = document.createElement("div")
	hp_values.style.float = "right"
	overlay.appendChild(hp_values)
	
	function createHpInput(name, number) {
		let input = document.createElement("input")
		input.type = "number"
		input.id = name
		if (old_index > -1) {
			input.value = parseInt(old_monster["HpRoll"][number])
		}
		input.style.minWidth = "0px"
		input.style.width = "50px"
		input.style.float = "none"
		input.value = 0
		hp_values.appendChild(input)
	}
	
	createHpInput("amount", 0)
	
	let d_text = document.createElement("t")
	d_text.textContent = "d"
	d_text.id = "d"
	hp_values.appendChild(d_text)
	
	createHpInput("size", 1)
	
	let plus_text = document.createElement("t")
	plus_text.textContent = " + "
	plus_text.id = "+"
	hp_values.appendChild(plus_text)
	
	createHpInput("bonus", 2)
	
	lineBreak(overlay, 2)
	
	let button = document.createElement("button")
	button.textContent = "Finish"
	button.addEventListener("click", function() { 
		let old_data = getJSON("Init")
		let health = diceCalc(IdGet("amount").value, IdGet("size").value, IdGet("bonus").value)
		let init = IdGet("InitInput").value
		if (foundIn("+", String(init)) || foundIn("-", String(init))) {
			init = diceCalc(1, 20, init)
		}
		let new_data = {
			"Init": init,
			"Name": IdGet("NameInput").value, 
			"AC": IdGet("ACInput").value,
			"HP": health, 
			"MaxHP": health, 
			"TempHP": 0, 
			"Cond": [],
			"Custom": true,
			"HpRoll": [IdGet("amount").value, IdGet("size").value, IdGet("bonus").value],
			"Number": "",
			"XP": 0
		}
		if (old_index > -1) {
			old_data[old_index] = new_data
		} else {
			old_data.push(new_data)	
		}
		setJSON("Init", old_data);
		loadOrder(); 
		IdGet("overlay").remove() })
	overlay.appendChild(button)
}

function addPreMade(name) {
	let saved = getJSON("Init")
	const selected_monster = monsters[name]
	const health = diceCalc(selected_monster["HP"][0], selected_monster["HP"][1], selected_monster["HP"][2])
	saved.push({
		"Init": diceCalc(1, 20, selected_monster["Initiative"]), 
		"Name": selected_monster["Name"], 
		"AC": selected_monster["Armour"], 
		"HP": health, 
		"MaxHP": health, 
		"TempHP": 0, 
		"Cond": [], 
		"Custom": false, 
		"Number": "",
		"XP": parseInt(selected_monster["XP"].split(" ")[0].replace(",", ""))})
	saved.sort((a, b) => b["Init"] - a["Init"])
	setJSON("Init", saved)
	loadOrder()
}

function renderHealth(monsterIndex) {
	const selectedMonster = getJSON("Init")[monsterIndex]
	let healthItem = IdGet(monsterIndex + "HP")
	if (selectedMonster["TempHP"] > 0) {
		healthItem.textContent = (selectedMonster["HP"] + " + " + selectedMonster["TempHP"] + " / " + selectedMonster["MaxHP"])
	} else {
		healthItem.textContent = (selectedMonster["HP"] + " / " + selectedMonster["MaxHP"])
	}
}

function loadOrder() {
	let parent = IdGet("init_box")
	while (parent.childNodes.length > 2) {
		parent.removeChild(parent.lastChild)
	}
	let init_data = getJSON("Init")
	init_data.sort((a, b) => b["Init"] - a["Init"])

	for (let i = 0; i < init_data.length; i++) {
		const selected_monster = init_data[i]
		
		let div = document.createElement("div")
		div.classList.add("monster-row")
		div.id = i
		if (selected_monster["HP"] === 0) {
			div.style.opacity = "50%"
		}
		parent.appendChild(div)
		
		const monster_text = [selected_monster["Init"], selected_monster["Name"] + " " + selected_monster["Number"], selected_monster["AC"], "0"]
		for (let j = 0; j < monster_text.length; j++) {
			let text_div = document.createElement("div")
			text_div.textContent = monster_text[j]
			text_div.id = i + ["Init", "Name", "AC", "HP"][j]
			div.appendChild(text_div)
		}
		renderHealth(i)
		
		let name = IdGet(i + "Name")
		name.classList.add("hover")
		name.addEventListener("click", function() {
			let overlay = createOverlay()
			let title = document.createElement("h2")
			title.textContent = selected_monster["Name"]
			overlay.appendChild(title)
			
			let numberLabel = document.createElement("label")
			numberLabel.textContent = "Number"
			overlay.appendChild(numberLabel)
			let numberEntry = document.createElement("input")
			numberEntry.type = "number"
			numberEntry.id = "number"
			numberEntry.value = selected_monster["Number"]
			numberLabel.for = numberEntry
			overlay.appendChild(numberEntry)
			
			lineBreak(overlay, 2)
			
			let destroy = document.createElement("button")
			destroy.textContent = "Destroy"
			destroy.addEventListener("click", function() {
				init_data = arrayDelete(init_data, i)
				setJSON("Init", init_data)
				IdGet("overlay").remove()
				loadOrder()
			})
			overlay.appendChild(destroy)
			
			let confirm = document.createElement("button")
			confirm.textContent = "Confirm"
			confirm.addEventListener("click", function() {
				selected_monster["Number"] = numberEntry.value;
				setJSON("Init", init_data)
				IdGet("overlay").remove()
				loadOrder()
			})
			overlay.appendChild(confirm)
		})
		
		let hp_input = document.createElement("input")
		hp_input.type = "number"
		hp_input.id = i + "_input"
		div.appendChild(hp_input)
		const buttons = {"Heal": function() { health("Heal", i) }, "Harm": function() { health("Harm", i) }, "Temp": function() { health("Temp", i) } }
		Object.entries(buttons).forEach(([key, value]) => {
			let hp_button = document.createElement("button")
			hp_button.addEventListener("click", value)
			hp_button.textContent = key
			div.appendChild(hp_button)
		})
		
		let conditions = document.createElement("div")
		let condition_text = ""
		for (let j = 0; j < selected_monster["Cond"].length; j++) {
			if (j === selected_monster["Cond"].length - 1) {condition_text = condition_text + selected_monster["Cond"][j]}
			else if (j === selected_monster["Cond"].length - 2) {condition_text = condition_text + selected_monster["Cond"][j]+ " and "}
			else {condition_text = condition_text + selected_monster["Cond"][j] + ", "}
		}
		conditions.textContent = condition_text
		conditions.classList.add("scrolling-text")
		conditions.style.width = (selected_monster["Cond"].length * 100) + "px";
		if (selected_monster["Cond"].length === 1) {conditions.style.animationDuration = "5s"}
		else {conditions.style.animationDuration = (selected_monster["Cond"].length * 2) + "s"}
		let condition_shell = document.createElement("div");
		condition_shell.appendChild(conditions);
		div.appendChild(condition_shell)
		
		let cond_button = document.createElement("button")
		cond_button.addEventListener("click", function() { editConditions(i) })
		cond_button.textContent = "Edit"
		div.appendChild(cond_button)
		
		let shell = document.createElement("div")
		div.appendChild(shell)
		
		let link_button = document.createElement("a")
		if (!selected_monster["Custom"]) {
			link_button.textContent = "View"
			link_button.href = "monster.html#" + selected_monster["Name"]
			link_button.target = "_blank"
		} else {
			link_button.textContent = "Edit"
			link_button.addEventListener("click", function() {editOverlay(i)})
		}
		div.appendChild(link_button)
	}
}

function health(type, monster_number) {
	let data = getJSON("Init")
	const input = IdGet(monster_number + "_input")
	let change = parseInt(input.value)
	if (!change) {
		return
	}
	if (type === "Heal") {
		data[monster_number]["HP"] += change
	} else if (type === "Harm") {
		if (data[monster_number]["TempHP"] > change) {
			data[monster_number]["TempHP"] -= change
		} else {
			change -= data[monster_number]["TempHP"]
			data[monster_number]["TempHP"] = 0
			data[monster_number]["HP"] -= change
		}
	} else if (type === "Temp") {
		data[monster_number]["TempHP"] = change
	}
	if (data[monster_number]["HP"] === 0) {
		IdGet(monster_number).style.opacity = "50%"
	} else {
		IdGet(monster_number).style.opacity = "100%"
	}
	setJSON("Init", data)
	limitHealth(monster_number)
	renderHealth(monster_number)
}

function limitHealth(monster_number) {
	let data = getJSON("Init")
	if (data[monster_number]["HP"] > data[monster_number]["MaxHP"]) {
		data[monster_number]["HP"] = data[monster_number]["MaxHP"]
	}
	if (data[monster_number]["HP"] < 0) {
		data[monster_number]["HP"] = 0
	}
	setJSON("Init", data)
}

function editConditions(monster_number) {
	const conditions_dict = {
		"Blinded": {
			"Can't See": "You can't see and automatically fail any ability chack that requires sight", 
			"Attacks Affected": "Attack rolls against you have Advantage, and your attack rolls have Disadvantage"
		}, 
		"Charmed": {
			"Can't Harm the Charmer": "You can't attack the charmer or target the charmer with damaging abilities or magical effects.",
			"Social Advantage": "The charmer has Advantage on any ability check to interact with you socially."
		}, 
		"Deafened": {
			"Can't Hear": "You can't hear and automatically fail any ability check that requires hearing."
		}, 
		"Exhaustion": {
			"Exhaustion Levels": "This condition is cumulative. Each time you receive it, you gain 1 Exhaustion level. You die if your Exhaustion level is 6",
			"D20 Tests Affected": "When you make a D20 Test, the roll is reduced by 2 times your Exhaustion level", 
			"Speed Reduced": "Your Speed is reduced by a number of feet equal to 5 times your Exhaustion level", 
			"Removing Exhaustion Levels": "Finishing a Long Rest removes 1 of your Exhaustion levels. When your Exhaustion level reaches 0, the condition ends"
		},
		"Frightened": {
			"Ability Checks and Attacks Affected": "You have Disadvantage on ability checks and attack rolls while the source of fear is within line of sight", 
			"Can't Approach": "You can't willingly move closer to the source of fear"
		},
		"Grappled": {
			"Speed 0": "Your Speed is 0 and can't increase", 
			"Attacks Affected": "You have Disadvantage on attack rolls  against any target other than the grappler",
			"Movable": "The grappler can drag or carry you when it moves, but every foot of movement costs it 1 extra foot unless you are Tiny or two or more sizes smaller than it."
		}, 
		"Incapacitated": {
			"Inactive": "You can't take any action, Bonus Action, or Reaction", 
			"No Concentration": "Your Concentration is broken", 
			"Speechless": "You can't speak", 
			"Surprised": "If you're Incapacitated when you roll Initiative, you have Disadvantage on the roll"
		}, 
		"Invisible": {
			"Surprise": "If you're Invisible when you roll Initiative, you have Advantage on the roll", 
			"Concealed": "You aren't affected by any effect that requires its target to be seen unless the effect's creator can somehow see you. Any equipment you are wearing or carrying is also concealed", 
			"Attacks Affected": "Attack rolls against you have Disadvantage, and your attack rolls have Advantage. If a creature can somehow see you, you don't gain this benefit against that creature"
		}, 
		"Paralyzed": {
			"Incapacitated": "You have the Incapacitated condition.", 
			"Speed 0": "Your Speed is 0 and can't increase. Saving Throws Affected. You automatically fail Strength and Dexterity saving throws", 
			"Attacks Affected": "Attack rolls against you have Advantage",
			"Automatic Critical Hits": "Any attack roll that hits you is a Critical Hit if the attacker is within 5 feet of you"
		}, 
		"Petrified": {
			"Turned to Inanimate Substance": "You are transformed, along with any nonmagical objects you are wearing and carrying, into a solid  inanimate substance, (usually stone). Your weight increases by a factor of ten, and you cease aging",  
			"Incapacitated": "You have the Incapacitated condition", 
			"Speed 0": "Your Speed is 0 and can't increase", 
			"Attacks Affected": "Attack rolls against you have Advantage", 
			"Saving Throws Affected": "You automatically fail Strength and Dexterity saving throws", 
			"Resist Damage": "You have Resistance to all damage", 
			"Poison Immunity": "You have Immunity to the Poisoned condition"
		}, 
		"Poisoned": {
			"Ability Checks and Attacks Affected": "You have Disadvantage on attack rolls and ability checks"
		}, 
		"Prone": {
			"Restricted Movement": "Your only movement options are to crawl or to spend an amount of movement equal to half your Speed (round down) to right yourself and thereby end the condition. If your Speed is 0, you can't right yourself",
			"Attacks Affected": "You have Disadvantage on attack rolls. An attack roll against you has Advantage if the attacker is within 5 feet of you. Otherwise, that attack roll has Disadvantage"
		}, 
		"Restrained": {
			"Speed 0": "Your Speed is 0 and can't increase",
			"Attacks Affected": "Attack rolls against you have Advantage, and your attack rolls have Disadvantage",
			"Saving Throws Affected": "You have Disadvantage on Dexterity saving throws"
		}, 
		"Stunned": {
			"Incapacitated": "You have the Incapacitated condition",
			"Saving Throws Affected": "You automatically fail Strength and Dexterity saving throws", 
			"Attacks Affected": "Attack rolls against you have Advantage"
		}, 
		"Unconscious": {
			"Inert": "You have the Incapacitated and Prone conditions, and you drop whatever you're holding. When this condition ends, you remain Prone",
			"Speed 0": "Your Speed is 0 and can't increase",
			"Attacks Affected": "Attack rolls against you have Advantage",
			"Saving Throws Affected": "You automatically fail Strength and Dexterity saving throws",
			"Automatic Critical Hits": "Any attack roll that hits you is a Critical Hit if the attacker is within 5 feet of you",
			"Unaware": "You're unaware of your surroundings"
		}
	}
	let data = getJSON("Init")
	let overlay_array = createOverlay(false, false, true);
	let overlay = overlay_array[0]
	overlay_array[1].addEventListener("click", function(event) {if (event.target.id === "overlay") { loadOrder(); this.remove() }})
	overlay.classList.add("tiles")
	overlay.style = "--columns: 5"
	overlay.style.padding = "8px"
	Object.entries(conditions_dict).forEach(([key, value]) => {
		let section = document.createElement("div")
		section.classList.add("portion")
		
		let input = document.createElement("div")
		
		let button = document.createElement("input")
		button.id = key + "_input"
		button.type = "checkbox"
		button.addEventListener("click", function() { flipCondition(monster_number, key) })
		input.appendChild(button)
		
		let label = document.createElement("label");
		label.textContent = key;
		label.setAttribute("for", key + "_input")
		input.appendChild(label)
		
		section.appendChild(input)
		
		Object.entries(value).forEach(([inner_key, inner_value]) => {
			section.appendChild(document.createElement("br"))
			let affector = document.createElement("div")
			let title = document.createElement("b")
			title.textContent = inner_key + ". "
			affector.appendChild(title)
			let text = document.createElement("t")
			text.textContent = inner_value
			affector.appendChild(text)
			section.appendChild(affector)
		})
		overlay.appendChild(section)
	});
	for (let i = 0; i < data[monster_number]["Cond"].length; i++) {
		let checkbox = IdGet(data[monster_number]["Cond"][i] + "_input")
		checkbox.checked = true
	}
}

function flipCondition(monster_number, condition) {
	let data = getJSON("Init")
	let checkbox = IdGet(condition + "_input")
	if ((!checkbox.checked) && (foundIn(condition, data[monster_number]["Cond"]))) {
		data[monster_number]["Cond"] = arrayDelete(data[monster_number]["Cond"], data[monster_number]["Cond"].indexOf(condition))
	} else if ((checkbox.checked) && (!foundIn(condition, data[monster_number]["Cond"]))) {
		data[monster_number]["Cond"].push(condition)
	}
	setJSON("Init", data)
}