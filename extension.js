const vscode = require("vscode");

function macAddressAddSemi(text) { 
  return text.match(/.{1,2}/g).join(":")
}

function macAddressRemoveSemi(text) {
  return text.split(/[:\.;-]/).join("")
}


/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  let toggleConvertMacAddress = vscode.commands.registerCommand(
    "test.toggleMacAddress",
    () =>{
      const editor = vscode.window.activeTextEditor;
      const selection = editor.selection;
      const selectText = editor.document.getText(selection);

      const lines = selectText.split('\n')

      let notMacAddressList = []

      let newLines = lines.map((line,index)=> {
        line = line.trim()

        let regMacAddressNoSemi = /^([a-fA-F0-9]{2}){6}$/

        let regMacAddressSemi = /^([a-fA-F0-9]{2}[:\.;-]){5}[a-fA-F0-9]{2}$/

        if(regMacAddressNoSemi.test(line)) {
          return `${macAddressAddSemi(line)}`
        } else if(regMacAddressSemi.test(line)) {
          return `${macAddressRemoveSemi(line)}`
        } else {
          notMacAddressList.push(index)

          return line
        }
      })
    
      const result = newLines.join("\n")

      editor.edit(builder => builder.replace(selection, result))

      let infoMessage = "Replace Mac Address success"

      if(notMacAddressList.length > 0) {
        infoMessage = `At line:${notMacAddressList.map(item => item + 1).join(',')} is not mac address`
      }

      vscode.window.showInformationMessage(infoMessage);
    }
  );


  context.subscriptions.push(toggleConvertMacAddress);
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};

