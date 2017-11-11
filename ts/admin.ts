
var launch_id_to_save = null;

function open_admin_popup(launch_id) {
    $.getJSON("ajax.php", {action: 'get', launch_id: launch_id}, function(result) {
        
        launch_id_to_save = launch_id;
        
        $('[name=admin_payload_type]').val(result['payload_type_icon']);
        $('[name=admin_destination_type]').val(result['destination_icon']);
        $('[name=admin_destination]').val(result['destination']);
        
        $("#dialog").dialog({width: "800", height: "400"});
    });
}

function save_launch() {
    var data = {};
    data['action'] = 'update';
    data['id'] = launch_id_to_save;
    data['payload_type'] = $('[name=admin_payload_type]').val();
    data['destination_type'] = $('[name=admin_destination_type]').val();
    data['destination'] = $('[name=admin_destination]').val();
    
    $.getJSON("ajax.php", data, function(result) {
        
        $("#dialog").dialog('close');
    });
}
