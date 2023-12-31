
const devClientId = '44ea08153660400f8d37a81b9d862207';
const devClientSecret = 'ddbcab3a0d6d458db71da8a9b65955fd';

const clientId = '94bc57ecc432408aa2eaa1a5f3a05f3a';
const clientSecret = '576a42bfd89a4fecac6258d1a2a760cc';

const devRedirectUri ="http://127.0.0.1:5000/spotifyAuthCallback";
const redirectUri = "https://nu3a-portfolio.onrender.com/spotifyAuthCallback";

const authEndpoint = 'https://accounts.spotify.com/authorize';
const tokenEndpoint = 'https://accounts.spotify.com/api/token';
const scopes = ['user-read-recently-played'];


const basicDevAuth = btoa(`${devClientId}:${devClientSecret}`);
const basicAuth = btoa(`${clientId}:${clientSecret}`);

function authorizeSpotify() {
    if (location.host == ("nu3a-portfolio.onrender.com")){
        window.location.href = `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join('%20')}&response_type=code`;
    }else if (location.host=="127.0.0.1:5000"){
        window.location.href = `${authEndpoint}?client_id=${devClientId}&redirect_uri=${devRedirectUri}&scope=${scopes.join('%20')}&response_type=code`;
    }else{
    alert("incorrect URL")
    }
}

//spotifyWebApiから取得した認証コードをtokens{access_token,refresh_token,get_date}に変換する。
async function exchangeCodeToTokens(code){
    const params = new URLSearchParams({
        code: code,
        redirect_uri: location.host == "nu3a-portfolio.onrender.com"? redirectUri:devRedirectUri,
        grant_type: 'authorization_code'
    });

    var options = {
        method:"POST",
        body: params.toString(),
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'Authorization': location.host == "nu3a-portfolio.onrender.com"? 'Basic '+basicAuth :'Basic ' + basicDevAuth,
        },
      };

    const data = await fetch(tokenEndpoint,options).then(response=> response.json()).then(data=>{return data}).catch(error=>console.log(error));
    d = new Date();
    const tokens ={
        accessToken:data.access_token,
        refreshToken:data.refresh_token,
        getDate: d.getTime()
    }
    return tokens
}

//引数のtokensをweb上のタグに設定する。
function setTokensToForm(tokens){
    document.getElementById("access_token").value=tokens.accessToken
    document.getElementById("refresh_token").value=tokens.refreshToken
    document.getElementById("get_date").value=tokens.getDate
}

//引数のtokenでサーバのcsvファイルを上書きする。
function updateTokens(tokens){
    body = JSON.stringify(tokens);
    fetch("/updateToken",{
        method:"POST",
        headers:{
            'Content-Type':'application/json'
        },
        body: body.toString(),
    });
}

//最近聞いたSpotifyの曲を取得する。
async function getRecentlyPlayedTracks() {
    document.getElementById("spotifyButton").style.display="none";

    //サーバの'/getToken'にGETリクエストを送り、spotify_tokens.csvファイルに記されているトークン情報を取得する。
    var tokens = await fetch("/getToken",{
        method:"GET",
    }).then(response=> {
        console.log(response)
        return response.json()
    }).then(data=>{
        return data
    }
        ).catch(error=>console.log(error));
    console.log("getTokenからの返り値",tokens);

    //現在時間がトークンの取得時刻から1時間以上経っている場合、refreshトークンを使ってWeb APIからaccessトークンを再取得する。
    if (new Date().getTime() - tokens.get_date>3600000 ){

        const body = new URLSearchParams({
            grant_type:'refresh_token',
            refresh_token:tokens.refresh_token,
        });
        console.log("トークンを更新します。 クエリ:",body.toString())
        var newTokens = await fetch(tokenEndpoint,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': location.host == "nu3a-portfolio.onrender.com"? 'Basic '+basicAuth :'Basic ' + basicDevAuth,
                //"Basic "←必ず半角スペースを入れること
            },
            body: body.toString(),
        }).then(response=>response.json()).then(data=>data).catch(error=>console.log(error));
        console.log("token更新、SpotifyAPIからの返り値:",newTokens);
        
        
        tokens.access_token = newTokens.access_token;
        tokens.get_date = new Date().getTime();
        
        console.log("updateをかけるtokenの内容",tokens)
        updateTokens(tokens)

    }else{
        console.log("最後のトークン取得から1時間以内のため、トークンを更新する必要はありません。")
    }

    const recentlyPlayedUrl = 'https://api.spotify.com/v1/me/player/recently-played';
    var access_token = tokens.access_token
    fetch(recentlyPlayedUrl, {
        headers: {
            'Authorization': `Bearer ${access_token}`
        }
    })
        .then(response => response.json())
        .then(data => {
            console.log("Spotify APIからのデータ取得成功")
            displayTracks(data.items)})
        .catch(error => console.error('Error:', error));
}

function displayTracks(tracks) {
    const tracksDiv = document.getElementById('tracks');
    tracksDiv.innerHTML = ""
    tracks.forEach(item => {
        const trackName = item.track.name;
        const artistName = item.track.artists[0].name;
        const imgurl = item.track.album.images[0].url
        const trackInfo = `<div class="col-3" ><div class="card"><img src=${imgurl} alt=${trackName} /><p class="trackTitle">${trackName}</p><p>${artistName}</p></div></div>`;
        tracksDiv.innerHTML += trackInfo;
    });
}




