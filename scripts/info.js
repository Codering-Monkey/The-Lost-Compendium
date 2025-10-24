import { IdGet, inject, capitalise, renderText } from "../scripts/script.js"

let info_source
let data

async function loadInfo() {
	const substring = window.location.search.substring(1).split('=')
	if (substring[0] === "location") {
		info_source = substring[1]
	} else {
		alert("An Error Occurred, Please specify a location query")
	}
	document.title = "The Lost Compendium - " + capitalise(info_source)
	let response = await fetch("../data/" + info_source + ".json")
	let old_data = await response.json()
	data = inject(old_data, info_source)
	let sidebar = IdGet("sidebar");
	let first = sidebar.firstChild
	if (first) {
		if (!(((first.className === "sidebar-multiitem") && (first.firstChild.textContent === data[0]["Name"] + "x")) || ((first.className === "sidebar-item") && (first.textContent === data[0]["Name"])))) {
			while (sidebar.firstChild) {
				sidebar.removeChild(sidebar.lastChild);
			}
			createSidebarStatic(sidebar, data, 1, "");
		}
	} else {
		createSidebarStatic(sidebar, data, 1, "");
	}
	loadContent()
}

export function renderItem(parent, name, indent, trail, parameter, func=function(param, evt) { if (evt.target.id === trail + name + "_item") { sidebarRedirect(param) } }) {
	let child = document.createElement("div");
	child.classList = "sidebar-item";
	child.textContent = name;
	child.id = trail + name + "_item"
	child.style = "--indent: " + indent;
	child.addEventListener("click", function(event) { func(parameter, event) })
	parent.appendChild(child)
}

function renderMultiItem(parent, name, indent, trail) {
	let container = document.createElement("div");
	container.classList = "sidebar-multiitem";

	let collapse_button = document.createElement("div")
	collapse_button.textContent = "+"
	collapse_button.id = trail + name + "_toggle"
	collapse_button.addEventListener("click", function(event) {toggleSidebarItem(trail, name); event.stopPropagation()})

	let child = document.createElement("div");
	child.classList = "sidebar-item";
	child.textContent = name;
	child.style = "--indent: " + indent;
	child.id = trail + name + "_item"
	child.appendChild(collapse_button)
	child.addEventListener("click", function() { sidebarRedirect(trail + name) })
	container.appendChild(child);

	let multi_container = document.createElement("div");
	multi_container.id = trail + name + "_container"
	multi_container.style.display = "none"
	container.appendChild(multi_container);

	parent.appendChild(container)
	return multi_container
}

function createSidebarStatic(parent, array_of_items, indent, trail) {
	for (let i = 0; i < array_of_items.length; i++) {
		const item = array_of_items[i]
		if ("SubItems" in item) {
			let new_container = renderMultiItem(parent, item["Name"], indent, trail)
			createSidebarStatic(new_container, item["SubItems"], indent+1, trail + item["Name"] + "/");	
		} else {
			renderItem(parent, item["Name"], indent, trail + item["Name"], trail + item["Name"])
		}
	}
}

function toggleSidebarItem(trail, multibar_name) {
	let toggle = IdGet(trail + multibar_name + "_toggle")
	let container = IdGet(trail + multibar_name + "_container")
	if (toggle.textContent === "x") {
		container.style.display = "none"
		toggle.textContent = "+"
	} else {
		container.style.display = "block"
		toggle.textContent = "x"
	}
}

function sidebarRedirect(button_name) {
	window.location.hash = "#" + info_source + "/" + button_name
	loadContent()
}

function loadContent() {
	let content_box = IdGet("content-box")
	while (content_box.firstChild) {
    	content_box.removeChild(content_box.lastChild);
  	}
	let trail = window.location.hash.split("#").pop().split("/")
	trail.shift()
	let item = data
	for (let i = 0; i < trail.length; i++) {
		trail[i] = trail[i].replaceAll("%20", " ")
		for (let j = 0; j < item.length; j++) {
			if (item[j]["Name"] === trail[i] && i+1 === trail.length) {
				item = item[j]
			} else if (item[j]["Name"] === trail[i]) {
				item = item[j]["SubItems"]
			}
		}
	}
	const content = item["Content"]
	for (let i = 0; i < content.length; i++) {
		let content_info = content[i];
		let content_item = document.createElement("div")
		if (content_info["Location"] === "Left") {
			content_item.classList = content_item.classList + "left"
		} else if (content_info["Location"] === "Right") {
			content_item.classList = content_item.classList + "right"
		} else if (content_info["Location"] === "Full") {
			content_item.classList = content_item.classList + "full"
		}
		if (content_info["Type"] === "Title") {
			let content_item_title = document.createElement("h2")
			content_item_title.textContent = content_info["Content"]
			content_item.appendChild(content_item_title)
		} else if (content_info["Type"] === "Subtitle") {
			let content_item_subtitle = document.createElement("h3")
			content_item_subtitle.textContent = content_info["Content"]
			content_item.appendChild(content_item_subtitle)
		} else if (content_info["Type"] === "Text") {
			let content_item_text = document.createElement("t")
			content_item_text.innerHTML = renderText(content_info["Content"])
			content_item.appendChild(content_item_text)
		} else if (content_info["Type"] === "Image") {
			const image_sizes = ["Thin", "Normal", "Wide"]
			let images = content_info["Content"]
			if (!("Normal" in images)) {
				if ("Thin" in images) {
					images["Normal"] = images["Thin"]
				} else if ("Wide" in images) {
					images["Normal"] = images["Wide"]
				} else {console.log("No Image Provided")}
			}
			if (!("Thin" in images)) {
				images["Thin"] = images["Normal"]
			}
			if (!("Wide" in images)) {
				images["Wide"] = images["Wide"]
			}
			for (let j = 0; j < image_sizes.length; j++) {
				let content_item_image = document.createElement("img")
				content_item_image.src = images[image_sizes[j]]
				content_item_image.classList = content_item_image.classList + " " + image_sizes[j].toLowerCase()
				content_item.appendChild(content_item_image)
			}
		} else if (content_info["Type"] === "Values") {
			Object.entries(content_info["Content"]).forEach(([key, value]) => {
				let text_key = document.createElement("strong")
				text_key.textContent = key + ": "
				content_item.appendChild(text_key)
				let text_value = document.createElement("t")
				text_value.innerHTML = renderText(value)
				content_item.appendChild(text_value)
				content_item.appendChild(document.createElement("br"))
			});
		} else if (content_info["Type"] === "Table") {
			let content_item_table = document.createElement("table")
			for (let i = 0; i < content_info["Content"].length; i++) {
				let current_row = document.createElement("tr")
				for (let j = 0; j < content_info["Content"][i].length; j++) {
					let current_cell = document.createElement("td")
					if (i === 0) {
						current_cell = document.createElement("th")
					}
					current_cell.innerHTML = renderText(content_info["Content"][i][j])
					current_row.appendChild(current_cell)
				}
				content_item_table.appendChild(current_row)
			}
			content_item.appendChild(content_item_table)
		}
		content_box.appendChild(content_item)
	}
}

window.addEventListener("hashchange", function() { loadInfo() });
if (window.location.pathname === "/pages/info.html") { loadInfo() }