function getValue() {
    const usernameText = document.getElementById("username").value;
    const passwordText = document.getElementById("password").value;

    return {usernameText, passwordText}
}

function login() {
    const user = getValue();
    const md5Pass = hex_md5(user.passwordText + user.usernameText);

    axios.post(LoginURL, {
        username: user.usernameText,
        password: md5Pass
    })
        .then(function (response) {
            const data = response.data;
            if(data.userAccess){
                window.location.href="./main.html"
            }else{
                $.messager.alert("警告","用户名或密码错误！","warning");
            }
        })
        .catch(error => $.messager.alert("错误","系统出现异常：" + error,"error"));
}

function signUp() {
    const user = getValue();
    const md5Pass = hex_md5(user.passwordText + user.usernameText);

    axios.post(RegisterURL, {
        username: user.usernameText,
        password: md5Pass
    })
        .then(function (response) {
            const data = response.data;
            if(data.userRegister){
                $.messager.alert("提示","注册成功！","info");
            }else{
                $.messager.alert("警告","该用户名已被注册！","warning");
            }
        })
        .catch(error => $.messager.alert("错误","系统出现异常：" + error,"error"));
}

document.onkeydown = function (e) {
    if (e.code === 'Enter') {
        login();
    }
};