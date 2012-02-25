// Helper functions
function setPastVisibility (visible) {
	$('.pastContainer')[visible ? 'show' : 'hide']();
	$('.task.past')[visible ? 'show' : 'hide']();
}

function setEmptyVisibility (visible) {
	// Show or hide all the empty sections
}

function setRecentVisibility (visible) {
	// Show or hide the recently finished items
}

$(document).ready(function () {
	$('.pref').bind('click', function (e) {
		var preferences = JSON.parse(localStorage.getItem('preferences')) || {};
		preferences[this.name] = this.checked ? 'checked' : false;
		localStorage.setItem('preferences', JSON.stringify(preferences));
		
		setPastVisibility($('[name="showPast"]').attr('checked'));
	});
	
	$('.finish').bind('click', function () {
		var self = this;
		$.ajax({
			url: '/updateTask',
			data: { params: { id: $(this).attr('value'), finished: true } },
			type: 'POST',
			success: function () {
				// Hide this task
				$(self).closest('.task').hide();
			}
		});
	});
	
	$('.delete').bind('click', function () {
		
	});
	
	// Check any boxes that are set by the preferences
	var prefs = JSON.parse(localStorage.getItem('preferences'));
	if (prefs) {
		for (var name in prefs) {
			if (prefs.hasOwnProperty(name)) {
				$('[name="' + name + '"]').attr('checked', prefs[name]);
			}
		}
	}
	
	setPastVisibility($('[name="showPast"]').attr('checked'));
});