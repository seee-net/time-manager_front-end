const usernameSpan = document.getElementById("usernameSpan");
const belongSpan = document.getElementById("belongSpan");

const olePassBox = document.getElementById("oldPass-ChPassWin");
const newPassBox = document.getElementById("newPass-ChPassWin");
const newRepeatPassBox = document.getElementById("newRepeatPass-ChPassWin");
const user = {username:""};

function getUserInfo(){
    axios.post(GetUserInfoURL)
        .then((response) => {
            usernameSpan.innerHTML = response.data.username;
            belongSpan.innerHTML = response.data.belong;
            user.username = response.data.username;
        })
        .catch(error => $.messager.alert("错误", "获取用户信息失败：" + error,"error"));
}

function tryLogin(){
    axios.post(LoginURL)
        .then((response) => {
            if(response.data.userAccess === false || response.data.userAccess === undefined)
                window.location.href = "./index.html"
        })
}

function logout() {
    axios.post(LoginURL)
        .then(() => window.location.href = "./index.html")
        .catch(error => $.messager.alert("错误", "系统出现异常：" + error,"error"));
}

function chPass() {
    const oldPass = olePassBox.value;
    const newPass = newPassBox.value;
    const newRepeatPass = newRepeatPassBox.value;

    if(newPass === newRepeatPass){
        //尝试修改密码
        const oldMD5Pass = hex_md5(oldPass + user.username);
        const newMD5Pass = hex_md5(newPass + user.username);

        axios.post(ChPassURL,{
            oldPassword: oldMD5Pass,
            newPassword: newMD5Pass
        })
            .then((response) => {
                if(response.data.userCh){
                    $.messager.alert("提示", "密码修改成功！", "info", function () {
                        closeChPassWin();
                        tryLogin();
                    });
                }else{
                    $.messager.alert("警告", "密码修改失败！", "warning");
                }
            })
            .catch(error => $.messager.alert("错误", "系统出现异常:" + error, "error"));
    } else {
        //重复密码错误
        $.messager.alert("警告", "两次密码不一致！", "warning");
    }
}

function closeChPassWin(){
    olePassBox.value = "";
    newPassBox.value = "";
    newRepeatPassBox.value = "";
    $('#ChPassWin').window('close');
}