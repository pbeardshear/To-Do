/** Database Models */
var User,
	Task;

exports.defineModels = function defineModels (mongoose, cb) {
    var Schema = mongoose.Schema;
	var ObjectID = Schema.ObjectId;
	
    User = new Schema({
	    username: {
			type: String,
			index: { unique: true }
	    },
	    password: {
			type: String,
			index: { required: true }
		}
	});
	
	Task = new Schema({
		owner: { type: ObjectID, ref: 'User' },
		name: { type: String, index: { required: true } },
		group: { type: String },
		due: { type: Date, required: true },
		estimate: { type: String },
		autoUpdate: { type: Boolean }
	});
	
    mongoose.model('User', User);
	mongoose.model('Task', Task);
    
	if (cb) {
		cb();
	}
};
