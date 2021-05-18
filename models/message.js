const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Message = mongoose.model(
	"Message", 
	new Schema({
		title: {type: String, required: true},
		message: {type: String, required: true},
		time: {type: Date, required: true},
		user: {type: Schema.Types.ObjectId, ref: 'User', required: true}

	})
)

module.exports = Message;