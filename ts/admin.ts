import axios from "axios";

var launch_id_to_save: number = null;

export async function open_admin_popup(launch_id: number) {
    var result = await axios.post("ajax.php", {action: 'get', launch_id: launch_id}, {responseType: "json"});

    launch_id_to_save = launch_id;
    
    $('[name=admin_payload_type]').val(result.data['payload_type_icon']);
    $('[name=admin_destination_type]').val(result.data['destination_icon']);
    $('[name=admin_destination]').val(result.data['destination']);
    
    $("#dialog").dialog({width: "800", height: "400"});
}

export async function save_launch() {
    var data: any = {};
    data['action'] = 'update';
    data['id'] = launch_id_to_save;
    
    data['payload_type'] = $('[name=admin_payload_type]').val();
    data['destination_type'] = $('[name=admin_destination_type]').val();
    data['destination'] = $('[name=admin_destination]').val();
    
    await axios.post("ajax.php", data);
    
    $("#dialog").dialog('close');
}
