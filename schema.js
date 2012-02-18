/** Database Models */
var User;

exports.defineModels = function defineModels( mongoose, cb ){
    var Schema = mongoose.Schema;
    User = new Schema({
	    username: {
		type: String,
		index: {unique: true}
	    },
	    password: {
		type: String,
		index: {required:true}
	    }});

    mongoose.model('User',User);
    if(cb)cb();
};
