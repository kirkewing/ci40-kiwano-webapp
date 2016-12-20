exports.preparePrevNextLinks = function (baseUrl, startIndex, pageSize, totalCount) {
    let responseLinks;

    let sIP = (startIndex - pageSize) < 0 ? 0 : (startIndex - pageSize);
    responseLinks = [];
    if (startIndex > 0) {
        responseLinks.push({"rel": "prev", "href": baseUrl + "?startIndex=" + sIP + '&pageSize=' + pageSize});
    }

    let sIN = (startIndex + pageSize) >= totalCount ? null : (startIndex + pageSize);
    if (sIN) {
        responseLinks.push({
            "rel": "next",
            "href": baseUrl + "?startIndex=" + sIN + '&pageSize=' + pageSize
        });
    }

    return responseLinks;
};

exports.sendJSONresponse = function (res, status, content) {
    res.status(status);
    res.json(content);
};

exports.isNumeric = function (n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
};

exports.getClientIDFromURL = function(clientUrl) {
    const reg = /clients\/([^\/]+)/;
    const res = reg.exec(clientUrl);
    if (!res) {
        return null;
    }
    if (res.length < 2) {
        return null;
    }
    return res[1];
};