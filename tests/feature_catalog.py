"""Feature inventory shared by unit and HTTP regression tests."""

import re

FEATURES = {
    "url-encode": ("encodeURL", "decodeURL", "copyURLOutput", "clearURL"),
    "base64": ("encodeBase64", "decodeBase64", "copyBase64Output", "clearBase64"),
    "diff-checker": ("compareDiff", "findNextDiff", "findPrevDiff", "copyDiffResult", "downloadDiffPatch", "clearDiff"),
    "xml": ("beautifyXML", "copyXMLOutput", "clearXML"),
    "json": ("beautifyJSON", "repairAndBeautifyJSON", "copyJSONOutput", "clearJSON"),
    "html": ("beautifyHTML", "copyHTMLOutput", "clearHTML"),
    "sql": ("beautifySQL", "copySQLOutput", "clearSQL"),
    "uuid": ("convertUUID", "clearUUID"),
    "timezone": ("addTimezoneConverter", "convertAllTimezones", "setCurrentTime", "clearAllTimezones"),
    "json-csv": ("convertJsonToCsv", "downloadCsv", "clearJsonCsv"),
    "xml-csv": ("convertXmlToCsv", "downloadXmlCsv", "clearXmlCsv"),
    "json-filter": ("addJsonFilterField", "applyJsonFilter", "downloadJsonFilter", "clearJsonFilter"),
    "xml-filter": ("addXmlFilterField", "applyXmlFilter", "downloadXmlFilter", "clearXmlFilter"),
    "data-extract-json": ("extractJsonPreview", "downloadJsonCSV", "handleExtractJsonFileUpload"),
    "data-extract-xml": ("extractXmlPreview", "downloadXmlCSV", "handleExtractXmlFileUpload"),
    "eml-analyzer": ("handleEmlFileUpload", "analyzeEml", "downloadEmlAnalysis", "clearEmlAnalyzer"),
    "rfc-validator": ("validateRFC", "downloadRFCReport", "clearRFCValidator"),
}

GLOBAL_ACTIONS = (
    "searchTools",
    "showSection",
    "gatherMatches",
    "replaceCurrent",
    "replaceAll",
    "setupDragAndDrop",
    "setupXmlDragAndDrop",
    "setupJsonFilterDragAndDrop",
    "setupXmlFilterDragAndDrop",
)


def section_markup(page, feature):
    """Return a tool section's markup without including later tool sections."""
    match = re.search(
        r'<(?:div|section)[^>]+id="' + re.escape(feature)
        + r'"[^>]*>.*?(?=<(?:div|section)\b(?=[^>]*\bclass="[^"]*\bsection\b)|\Z)',
        page,
        flags=re.DOTALL,
    )
    return match.group(0) if match else None
