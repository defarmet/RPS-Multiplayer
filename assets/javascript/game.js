var config = {
	apiKey: "AIzaSyCyeR54iFQZYblO5IRwV0H0rN33kUwUXyQ",
	authDomain: "rps-multiplayer-70f23.firebaseapp.com",
	databaseURL: "https://rps-multiplayer-70f23.firebaseio.com",
	projectId: "rps-multiplayer-70f23",
	storageBucket: "rps-multiplayer-70f23.appspot.com",
	messagingSenderId: "591171253387",
	appId: "1:591171253387:web:07ac58304edd3b6109508e"
};
firebase.initializeApp(config);
var db = firebase.database();

var wins = 0;
var loss = 0;
var player = 0;
var displayed_buttons = false;
var displayed_winner = false;
var player_data = {
	player_1: false,
	player_2: false,
	choice_1: -1,
	choice_2: -1,
}

function set_player_data(snapshot) {
	var data = snapshot.val();
	if (!data) {
		db.ref("/data").set(player_data);
	} else {
		player_data = data;
	}
}

function update_data(snapshot) {
	set_player_data(snapshot);
	if (!player_data.player_1) {
		db.ref("data/player_1").set(true);
		db.ref("data/player_1").onDisconnect().set(false);
		db.ref("data/choice_1").onDisconnect().set(-1);
		player = 1;
		display_choices();
	} else if (!player_data.player_2) {
		db.ref("data/player_2").set(true);
		db.ref("data/player_2").onDisconnect().set(false);
		db.ref("data/choice_2").onDisconnect().set(-1);
		player = 2;
		display_choices();
	}
}

function add_connection(snapshot) {
	if (snapshot.val()) {
		var conn = db.ref("connections").push(true);
		conn.onDisconnect().remove();
		db.ref("data").once("value").then(update_data);
	}
}

function display_connections(snapshot) {
	$("#connections").text(snapshot.numChildren());
}

function reset_choices() {
	$("#choice_1").empty();
	$("#choice_2").empty();
	$("#result").empty();
	if (player === 1) {
		db.ref("data/choice_1").set(-1);
	} else if (player === 2) {
		db.ref("data/choice_2").set(-1);
	}
	displayed_winner = false;
}

function get_winner() {
	var choice_1 = player_data.choice_1;
	var choice_2 = player_data.choice_2;
	if (choice_1 === 'r' && choice_2 === 'r' ||
		choice_1 === 'p' && choice_2 === 'p' ||
		choice_1 === 's' && choice_2 === 's') {
		$("#result").text("TIE");
	} else if (choice_1 === 'r' && choice_2 === 's' ||
		choice_1 === 'p' && choice_2 === 'r' ||
		choice_1 === 's' && choice_2 === 'p') {
		if (player === 1) {
			wins++;
			$("#result").text("YOU WIN");
		} else if (player === 2) {
			loss++;
			$("#result").text("YOU LOSE");
		} else {
			$("#result").text("PLAYER 1 WINS");
		}
	} else if (choice_1 === 'r' && choice_2 === 'p' ||
		choice_1 === 'p' && choice_2 === 's' ||
		choice_1 === 's' && choice_2 === 'r') {
		if (player === 1) {
			loss++;
			$("#result").text("YOU LOSE");
		} else if (player === 2) {
			wins++;
			$("#result").text("YOU WIN");
		} else {
			$("#result").text("PLAYER 2 WINS");
		}
	}

	if (player !== 0) {
		$("#wins").text("Wins: " + wins);
		$("#loss").text("Losses: " + loss);
	}
}

function get_img(choice) {
	if (choice === 'r') {
		return $("<img>").attr("src", "assets/images/Rock.png");
	} else if (choice === 'p') {
		return $("<img>").attr("src", "assets/images/Paper.png");
	} else if (choice === 's') {
		return $("<img>").attr("src", "assets/images/Scissors.png");
	}
}

function write_player_data(snapshot) {
	set_player_data(snapshot);
	if (player_data.choice_1 !== -1 && player_data.choice_2 !== -1) {
		$("#choice_1").append(get_img(player_data.choice_1));
		$("#choice_2").append(get_img(player_data.choice_2));
		displayed_winner = true;
		setTimeout(reset_choices, 5000);
		get_winner();
	}
}

db.ref(".info/connected").on("value", add_connection);
db.ref("connections").on("value", display_connections);
db.ref("data").on("value", write_player_data);

function create_button(text, val, btn_type) {
	var btn = $("<button>").addClass("choice btn " + btn_type)
	btn.attr("value", val);
	btn.text(text);
	$("#choices").append(btn);
}

function display_choices() {
	if (!displayed_buttons) {
		create_button("Rock", 'r', "btn-success");
		create_button("Paper", 'p', "btn-danger");
		create_button("Scissors", 's', "btn-primary");
		displayed_buttons = true;
	}

	$("#wins").text("Wins: " + wins);
	$("#loss").text("Losses: " + loss);
}

function set_choice() {
	if (!displayed_winner) {
		if (player === 1) {
			db.ref("data/choice_1").set($(this).attr("value"));
		} else if (player === 2) {
			db.ref("data/choice_2").set($(this).attr("value"));
		}
	}
}

$(document).on("click", ".choice", set_choice);

function update_chat(snapshot) {
	var p = $("<p>").addClass("chat");
	p.text(snapshot.val());
	$("#chat").append(p);
}

function send_message(e) {
	e.preventDefault();
	var message = "";
	if (player > 0) {
		message = "Player " + player + ": " + $("#message").val().trim();
	} else {
		message = "Guest: " + $("#message").val().trim();
	}
	var message_ref = db.ref("chat").push(message);
	message_ref.onDisconnect().remove();
	$("#message").val("");
}

$("#btn").click(send_message);
db.ref("chat").on("child_added", update_chat);
