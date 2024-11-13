// ---- Define your dialogs  and panels here ----



let permission_panel = define_new_effective_permissions("ep", true) 

let user_select_field = define_user_dropdown_field("user_select", function(selected_user){$('#ep').attr('username', selected_user)})
let file_select_field = define_file_dropdown_field("file_select", function(selected_file){$('#ep').attr('filepath', selected_file)})

let selector_div = $('<div id="effperm_selectors"></div>')
selector_div.append(user_select_field)
selector_div.append(file_select_field)

permission_panel.append(selector_div)
$('#sidepanel').append(permission_panel)

let state = getStateAsDict()
console.log(state)

let new_dialog = define_new_dialog('new_dialog', title = 'Permission Information')
// $('#sidepanel').append(new_dialog); 
// console.log('clicked!')
//     new_dialog.dialog('open')
//     console.log($('#ep').attr('filepath'), $('#ep').attr('username'), $(this).attr('permission_name'))

//adding
//adding



$('.perm_info').click(function(){
    console.log('clicked!')
    new_dialog.dialog('open')
    console.log($('#ep').attr('filepath'), $('#ep').attr('username'), $(this).attr('permission_name')) 
    let my_file_obj_var = path_to_file[$('#ep').attr('filepath')]
    let my_user_obj_var = all_users[$('#ep').attr('username')]
    let new_user_action = allow_user_action(my_file_obj_var, my_user_obj_var, $(this).attr('permission_name'), true)
    let new_exp_text = get_explanation_text(new_user_action)

    new_dialog.html(new_exp_text)
})

//import {getStateAsDict} from './model.js';
//import {setStateFromDict} from './model.js';

$('.ui-icon-closethick').click(function(){
    console.log('clicked'); 
    setStateFromDict(permission_state); 
  })




// ---- Display file structure ----

// (recursively) makes and returns an html element (wrapped in a jquery object) for a given file object
function make_file_element(file_obj) {
    let file_hash = get_full_path(file_obj)

    if(file_obj.is_folder) {
        let folder_elem = $(`<div class='folder' id="${file_hash}_div">
            <h3 id="${file_hash}_header">
                <span class="oi oi-folder" id="${file_hash}_icon"/> ${file_obj.filename} 
                <button class="ui-button ui-widget ui-corner-all permbutton" path="${file_hash}" id="${file_hash}_permbutton"> 
                    <span class="oi oi-lock-unlocked" id="${file_hash}_permicon"/> 
                </button>
            </h3>
        </div>`)

        // append children, if any:
        if( file_hash in parent_to_children) {
            let container_elem = $("<div class='folder_contents'></div>")
            folder_elem.append(container_elem)
            for(child_file of parent_to_children[file_hash]) {
                let child_elem = make_file_element(child_file)
                container_elem.append(child_elem)
            }
        }
        return folder_elem
    }
    else {
        return $(`<div class='file'  id="${file_hash}_div">
            <span class="oi oi-file" id="${file_hash}_icon"/> ${file_obj.filename}
            <button class="ui-button ui-widget ui-corner-all permbutton" path="${file_hash}" id="${file_hash}_permbutton"> 
                <span class="oi oi-lock-unlocked" id="${file_hash}_permicon"/> 
            </button>
        </div>`)
    }
}

for(let root_file of root_files) {
    let file_elem = make_file_element(root_file)
    $( "#filestructure" ).append( file_elem);    
}



// make folder hierarchy into an accordion structure
$('.folder').accordion({
    collapsible: true,
    heightStyle: 'content'
}) // TODO: start collapsed and check whether read permission exists before expanding?


// -- Connect File Structure lock buttons to the permission dialog --

// open permissions dialog when a permission button is clicked
let permission_state = getStateAsDict()
$('.permbutton').click( function( e ) {
    // Set the path and open dialog:
    let path = e.currentTarget.getAttribute('path');
    perm_dialog.attr('filepath', path)
    perm_dialog.dialog('open')
    //open_permissions_dialog(path)

    // Deal with the fact that folders try to collapse/expand when you click on their permissions button:
    e.stopPropagation() // don't propagate button click to element underneath it (e.g. folder accordion)
    // Emit a click for logging purposes:
    emitter.dispatchEvent(new CustomEvent('userEvent', { detail: new ClickEntry(ActionEnum.CLICK, (e.clientX + window.pageXOffset), (e.clientY + window.pageYOffset), e.target.id,new Date().getTime()) }))
    console.log('lock clicked')
    permission_state = getStateAsDict()
});


// ---- Assign unique ids to everything that doesn't have an ID ----
$('#html-loc').find('*').uniqueId() 