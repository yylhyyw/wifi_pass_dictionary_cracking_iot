function searchLoading() {
    location.href = '/search'
    document.getElementById("searchLoader").style.display = "block";
    myVar = setTimeout(showSeaerchPage, 35000);
  }
  
function showSeaerchPage() {
    document.getElementById("searchLoader").style.display = "none";
    document.getElementById("searchResult").style.display = "block";
    document.getElementById("log").style.display = "none";
    document.getElementById("deviceStatus").style.display = "none";
}

function showDeviceStatus() {
  location.href = '/device'
  document.getElementById("searchLoader").style.display = "block";
  myVar = setTimeout(showDevicePage, 1000);
}

function showDevicePage() {
  document.getElementById("searchLoader").style.display = "none";
  document.getElementById("deviceStatus").style.display = "block";
}

function backToHome() {
  location.href = '/..'
}

function showLog() {
  location.href = '/log'
  document.getElementById("log").style.display = "block";
  document.getElementById("deviceStatus").style.display = "none";
  document.getElementById("searchResult").style.display = "none";
}