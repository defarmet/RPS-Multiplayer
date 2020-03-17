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

var player = 0;
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
		player_data.player_1 = true;
		db.ref("data/player_1").onDisconnect().set(false);
		player = 1;
	} else if (!player_data.player_2) {
		player_data.player_2 = true;
		db.ref("data/player_2").onDisconnect().set(false);
		player = 2;
	}
	db.ref("data").set(player_data);
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

function write_player_data(snapshot) {
	set_player_data(snapshot);
	$("#player_1").text(player_data.player_1);
	$("#player_2").text(player_data.player_2);
}

db.ref(".info/connected").on("value", add_connection);
db.ref("connections").on("value", display_connections);
db.ref("data").on("value", write_player_data);
