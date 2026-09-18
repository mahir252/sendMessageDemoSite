const socket = io();


// ==================================================
// GLOBAL VARIABLES
// ==================================================

let onlineUsers = [];


// ==================================================
// BLOCK STATE
// ==================================================

let currentUserBlockedChatUser = false;
let chatContextMenu = null;
let chatSearchActive = false;

// ==================================================
// PINNED NOTIFICATIONS
// ==================================================

let pinnedNotifications = [];
let currentChatUser = null;

let typingTimeout = null;
let isTyping = false;

// ==================================================
// NAVIGATION HISTORY
// ==================================================

let pageHistory = [];
let currentPageId = null;
let isGoingBack = false;
let isInitialNav = true;


// ==================================================
// CURRENT USER
// ==================================================

const currentUser = JSON.parse(
    localStorage.getItem("user")
);

if (!currentUser) {

    window.location.href = "login.html";

    throw new Error("User not logged in");

}


// ==================================================
// ELEMENTS
// ==================================================

const navButtons =
    document.querySelectorAll(".nav-btn");

const pages =
    document.querySelectorAll(".page");

const chatSection =
    document.getElementById("chatSection");

const chatUserName =
    document.getElementById("chatUserName");

const chatUserStatus =
    document.getElementById("chatUserStatus");

const chatUserImage =
    document.getElementById("chatUserImage");
const typingIndicator =
    document.getElementById("typingIndicator");

const messages =
    document.getElementById("messages");

const messageInput =
    document.getElementById("messageInput");

const sendBtn =
    document.getElementById("sendBtn");

const backChatBtn =
    document.getElementById("backChatBtn");



// ==================================================
// ATTACHMENT ELEMENTS
// ==================================================

const attachmentBtn =
    document.getElementById("attachmentBtn");

const attachmentMenu =
    document.getElementById("attachmentMenu");

const sendPhotoBtn =
    document.getElementById("sendPhotoBtn");

const sendVideoBtn =
    document.getElementById("sendVideoBtn");

const photoInput =
    document.getElementById("photoInput");

const videoInput =
    document.getElementById("videoInput");



const notificationList =
    document.getElementById("notificationList");
const bioInput =
    document.getElementById("bioInput");

const saveBioBtn =
    document.getElementById("saveBioBtn");

const bioText =
    document.getElementById("bioText");

const bioEditor =
    document.getElementById("bioEditor");

const savedBio =
    document.getElementById("savedBio");

const changeBioBtn =
    document.getElementById("changeBioBtn");

const changeBioOverlay =
    document.getElementById("changeBioOverlay");

const bioOkBtn =
    document.getElementById("bioOkBtn");

const bioConfirmStep =
    document.getElementById("bioConfirmStep");

const newBioStep =
    document.getElementById("newBioStep");

const newBioInput =
    document.getElementById("newBioInput");

const saveNewBioBtn =
    document.getElementById("saveNewBioBtn");

const ignoreBioBtn =
    document.getElementById("ignoreBioBtn");

// ==================================================
// CHANGE ACCOUNT POPUP
// ==================================================

const changeAccountInfoOverlay =
    document.getElementById(
        "changeAccountInfoOverlay"
    );

const changeAccountCloseBtn =
    document.getElementById(
        "changeAccountCloseBtn"
    );

const changeAccountTitle =
    document.getElementById(
        "changeAccountTitle"
    );

const changeAccountDescription =
    document.getElementById(
        "changeAccountDescription"
    );

const changeAccountInputLabel =
    document.getElementById(
        "changeAccountInputLabel"
    );

const changeAccountInput =
    document.getElementById(
        "changeAccountInput"
    );

const changeSingleInputBox =
    document.getElementById(
        "changeSingleInputBox"
    );

const changePasswordBox =
    document.getElementById(
        "changePasswordBox"
    );


const changeAccountSaveBtn =
    document.getElementById(
        "changeAccountSaveBtn"
    );


// Current popup mode

let changeAccountMode = null;



const blockListBtn =
    document.getElementById(
        "blockListBtn"
    );

const backFromBlockListBtn =
    document.getElementById(
        "backFromBlockListBtn"
    );   




if (blockListBtn) {

    blockListBtn.addEventListener(
        "click",
        () => {

            showPage(
                "blockListPage"
            );

        }
    );

}




if (backFromBlockListBtn) {

    backFromBlockListBtn.addEventListener(
        "click",
        () => {

            showPage(
                "otherSettingsPage"
            );

        }
    );

}



// ==================================================
// DESKTOP BACK BUTTON VISIBILITY
// ==================================================

function updateDesktopBackButtonVisibility() {

    const desktopBackBtn =
        document.getElementById("desktopBackBtn");

    if (!desktopBackBtn) {
        return;
    }


    // Show only on desktop AND when history exists

    const isDesktop =
        window.innerWidth >= 600;

    const hasHistory =
        pageHistory.length > 0;


    if (isDesktop && hasHistory) {

        desktopBackBtn.classList.add("visible");

    } else {

        desktopBackBtn.classList.remove("visible");

    }

}


// ==================================================
// GO BACK — PREVIOUS SECTION
// ==================================================

function goBackSection() {

    // ==========================================
    // IF CHAT IS OPEN, CLOSE IT FIRST
    // ==========================================

    if (document.body.classList.contains("chat-mode")) {

        document.body.classList.remove("chat-mode");


        if (chatSection) {

            chatSection.classList.remove("active");

        }


        currentChatUser = null;


        if (pageHistory.length > 0) {

            const previousPage =
                pageHistory.pop();

            isGoingBack = true;

            showPage(previousPage);

        } else {

            isGoingBack = true;

            showPage("friendsPage");

        }


        return;

    }


    // ==========================================
    // NORMAL BACK — PREVIOUS SECTION
    // ==========================================

    if (pageHistory.length > 0) {

        const previousPage =
            pageHistory.pop();


        isGoingBack = true;

        showPage(previousPage);

    } else {

        // No history → go to Friends (default)

        if (currentPageId !== "friendsPage") {

            isGoingBack = true;

            showPage("friendsPage");

        }

    }

}


// ==================================================
// ANDROID / BROWSER BACK BUTTON
// ==================================================

window.addEventListener(
    "popstate",
    () => {

        goBackSection();

    }
);


// ==================================================
// DESKTOP BACK BUTTON CLICK
// ==================================================

document.addEventListener(
    "click",
    (event) => {

        if (
            event.target &&
            event.target.id === "desktopBackBtn"
        ) {

            goBackSection();

        }

    }
);


// ==================================================
// RESIZE — UPDATE BACK BUTTON VISIBILITY
// ==================================================

window.addEventListener(
    "resize",
    () => {

        updateDesktopBackButtonVisibility();

    }
);



function getUserId() {

    return Number(currentUser.id);

}




// ==================================================
// DESKTOP CHAT LAYOUT
// ==================================================

function createDesktopChatLayout() {

    if (document.getElementById("desktopChatLayout")) {
        return;
    }

    const layout = document.createElement("div");

    layout.id = "desktopChatLayout";

    layout.innerHTML = `

        <div id="desktopChatList">

            <div class="desktop-chat-title">
                <h2>Chats</h2>
            </div>

        </div>


        <div id="desktopChatArea">

            <div id="noChatsMessage">
                No chats selected
            </div>

        </div>

    `;

    document.body.appendChild(layout);
}


// CREATE DESKTOP UI
createDesktopChatLayout();




const desktopProfileTopBtn =
    document.getElementById("desktopProfileTopBtn");

const desktopProfileTopImage =
    document.getElementById("desktopProfileTopImage");

if (desktopProfileTopBtn) {

    desktopProfileTopBtn.addEventListener(
        "click",
        () => {
            showPage("profilePage");
        }
    );

}





const desktopPageHost =
    document.getElementById("desktopPageHost");

const isDesktop =
    window.innerWidth >= 600;




// ==================================================
// SOCKET ONLINE
// ==================================================

socket.emit(
    "user-online",
    getUserId()
);


// ==================================================
// NAVIGATION
// ==================================================

function showPage(pageId) {









    console.log(
        "Showing page:",
        pageId
    );




   




    // ==========================================
    // HIDE ALL PAGES
    // ==========================================

    pages.forEach(page => {

        page.classList.remove(
            "active"
        );

    });


    // ==========================================
    // HIDE CHAT
    // ==========================================




const desktopPageHost =
    document.getElementById("desktopPageHost");

if (
    window.innerWidth >= 600 &&
    desktopPageHost &&
    chatSection &&
    chatSection.parentElement !== desktopPageHost
) {
    desktopPageHost.appendChild(chatSection);
}








    if (chatSection) {

        chatSection.classList.remove(
            "active"
        );

    }


    const noChatsMessage =
    document.getElementById("noChatsMessage");

if (noChatsMessage) {
    noChatsMessage.style.display = "flex";
}


    // ==========================================
    // SHOW REQUESTED PAGE
    // ==========================================

    const page =
        document.getElementById(
            pageId
        );


       
    if (!page) {

        console.error(
            "Page not found:",
            pageId
        );

        return;

    }

    if (
    isDesktop &&
    desktopPageHost &&
    page.parentElement !== desktopPageHost
) {

    if (!page.dataset.desktopOriginalParent) {

        page.dataset.desktopOriginalParent =
            page.parentElement.id || "";

    }

    desktopPageHost.appendChild(page);
}


    page.classList.add(
        "active"
    );




    // ==========================================
    // UPDATE NAVIGATION
    // ==========================================

    navButtons.forEach(button => {

        button.classList.remove(
            "active"
        );


        if (
            button.dataset.page ===
            pageId
        ) {

            button.classList.add(
                "active"
            );

        }

    });



    // ==========================================
// PUSH TO BROWSER HISTORY (for Android back)
// ==========================================

if (!isInitialNav) {

    try {

        window.history.pushState(
            { pageId: pageId },
            "",
            ""
        );

    } catch (error) {

        console.log(
            "History pushState error:",
            error
        );

    }

}

isInitialNav = false;


// ==========================================
// UPDATE DESKTOP BACK BUTTON
// ==========================================

updateDesktopBackButtonVisibility();






    console.log(
        "Active page:",
        page.id
    );



}


// ==========================================
// OTHER SETTINGS BUTTON
// ==========================================

const otherSettingsBtn =
    document.getElementById(
        "otherSettingsBtn"
    );


if (otherSettingsBtn) {

    otherSettingsBtn.addEventListener(
        "click",
        () => {

            showPage(
                "otherSettingsPage"
            );

        }
    );

}


// ==========================================
// REPORT BUTTON
// ==========================================

const reportBtn =
    document.getElementById(
        "reportBtn"
    );


if (reportBtn) {

    reportBtn.addEventListener(
        "click",
        () => {

            showPage(
                "reportPage"
            );

        }
    );

}

// ==========================================
// BACK TO PROFILE FROM OTHER SETTINGS
// ==========================================

const backToProfileBtn =
    document.getElementById(
        "backToProfileBtn"
    );


if (backToProfileBtn) {

    backToProfileBtn.addEventListener(
        "click",
        () => {

            showPage(
                "profilePage"
            );

        }
    );

}


// ==========================================
// MESSAGE SAVE TYPE POPUP
// ==========================================

const messageSaveTypeBtn =
    document.getElementById(
        "messageSaveTypeBtn"
    );

const messageSaveOverlay =
    document.getElementById(
        "messageSaveOverlay"
    );

const closeMessageSavePopup =
    document.getElementById(
        "closeMessageSavePopup"
    );


// ==========================================
// OPEN POPUP
// ==========================================

if (
    messageSaveTypeBtn &&
    messageSaveOverlay
) {

    messageSaveTypeBtn.addEventListener(
        "click",
        () => {

            messageSaveOverlay.classList.add(
                "active"
            );

        }
    );

}


// ==========================================
// CLOSE POPUP
// ==========================================

if (
    closeMessageSavePopup &&
    messageSaveOverlay
) {

    closeMessageSavePopup.addEventListener(
        "click",
        () => {

            messageSaveOverlay.classList.remove(
                "active"
            );

        }
    );

}


// ==========================================
// CLICK OUTSIDE POPUP = CLOSE
// ==========================================

if (messageSaveOverlay) {

    messageSaveOverlay.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                messageSaveOverlay
            ) {

                messageSaveOverlay.classList.remove(
                    "active"
                );

            }

        }
    );

}






navButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            showPage(
                button.dataset.page
            );

        }
    );

});


// ==================================================
// PROFILE
// ==================================================

async function loadProfile() {

    try {

        const response =
            await fetch(
                `/api/user/${getUserId()}`
            );


        if (!response.ok) {

            throw new Error(
                "Profile request failed"
            );

        }


        const result =
            await response.json();


        if (
            !result.success ||
            !result.user
        ) {

            return;

        }


        const user =
            result.user;


        // ==================================================
        // BIO ELEMENTS
        // ==================================================

        const bioInput =
            document.getElementById(
                "bioInput"
            );

        const saveBioBtn =
            document.getElementById(
                "saveBioBtn"
            );

        const bioText =
            document.getElementById(
                "bioText"
            );

        const bioEditor =
            document.getElementById(
                "bioEditor"
            );

        const savedBio =
            document.getElementById(
                "savedBio"
            );

        const changeBioBtn =
            document.getElementById(
                "changeBioBtn"
            );


        // ==================================================
        // BIO
        // ==================================================

        if (
            user.bio &&
            user.bio.trim()
        ) {

            // ----------------------------------------------
            // BIO EXISTS
            // ----------------------------------------------

            if (bioText) {

                bioText.textContent =
                    user.bio;

            }


            // Input + Save hide

            if (bioEditor) {

                bioEditor.style.display =
                    "none";

            } else {

                // Fallback যদি bioEditor না থাকে

                if (bioInput) {

                    bioInput.style.display =
                        "none";

                }

                if (saveBioBtn) {

                    saveBioBtn.style.display =
                        "none";

                }

            }


            // Saved bio show

            if (savedBio) {

                savedBio.style.display =
                    "flex";

            }


        } else {

            // ----------------------------------------------
            // BIO DOES NOT EXIST
            // ----------------------------------------------

            if (bioText) {

                bioText.textContent =
                    "";

            }


            // Saved bio hide

            if (savedBio) {

                savedBio.style.display =
                    "none";

            }


            // Input editor show

            if (bioEditor) {

                bioEditor.style.display =
                    "block";

            }


            // Input show

            if (bioInput) {

                bioInput.style.display =
                    "block";

                bioInput.value =
                    "";

            }


            // Save button show

            if (saveBioBtn) {

                saveBioBtn.style.display =
                    "inline-block";

            }

        }


        // ==================================================
        // PROFILE ELEMENTS
        // ==================================================

        const profileName =
            document.getElementById(
                "profileName"
            );


        const profileDisplayName =
            document.getElementById(
                "profileDisplayName"
            );


        const profileUsername =
            document.getElementById(
                "profileUsername"
            );


        const profileImage =
            document.getElementById(
                "profileImage"
            );


        const profileBtnImage =
            document.getElementById(
                "profileBtnImage"
            );







            const profilePhotoOverlay =
    document.getElementById("profilePhotoOverlay");

const largeProfileImage =
    document.getElementById("largeProfileImage");

const largeProfileName =
    document.getElementById("largeProfileName");

const largeProfileUsername =
    document.getElementById("largeProfileUsername");

const closeProfilePhotoBtn =
    document.getElementById("closeProfilePhotoBtn");


// ==========================================
// PROFILE IMAGE CLICK
// ==========================================

if (profileImage) {

    profileImage.addEventListener(
        "click",
        () => {

            // বড় profile image
            if (largeProfileImage) {

                largeProfileImage.src =
                    profileImage.src ||
                    "/default-profile.png";

            }



            if (desktopProfileTopImage) {
    desktopProfileTopImage.src =
        profileImage.src;
}















            // Name
            if (largeProfileName) {

                largeProfileName.textContent =
                    profileDisplayName?.textContent ||
                    "User";

            }


            // Username
            if (largeProfileUsername) {

                largeProfileUsername.textContent =
                    profileUsername?.textContent ||
                    "@username";

            }


            // Popup open
            if (profilePhotoOverlay) {

                profilePhotoOverlay.classList.add(
                    "active"
                );

            }

        }
    );

}


// ==========================================
// CLOSE BUTTON
// ==========================================

if (closeProfilePhotoBtn) {

    closeProfilePhotoBtn.addEventListener(
        "click",
        () => {

            profilePhotoOverlay?.classList.remove(
                "active"
            );

        }
    );

}


// ==========================================
// OUTSIDE CLICK
// ==========================================

if (profilePhotoOverlay) {

    profilePhotoOverlay.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                profilePhotoOverlay
            ) {

                profilePhotoOverlay.classList.remove(
                    "active"
                );

            }

        }
    );

}


        // ==================================================
        // NAME
        // ==================================================

        if (profileName) {

            profileName.textContent =
                user.name || "";

        }


        if (profileDisplayName) {

            profileDisplayName.textContent =
                user.name || "";

        }


        // ==================================================
        // USERNAME
        // ==================================================

        if (profileUsername) {

            profileUsername.textContent =
                "@" +
                (user.username || "");

        }


        // ==================================================
        // PROFILE IMAGE
        // ==================================================

        const image =
            user.profile_image ||
            "/default-profile.png";


        if (profileImage) {

            profileImage.src =
                image;

        }


        if (profileBtnImage) {

            profileBtnImage.src =
                image;

        }


        if (desktopProfileTopImage) {

    desktopProfileTopImage.src =
        image;

}


        // ==================================================
        // UPDATE CURRENT USER
        // ==================================================

        currentUser.name =
            user.name;


        currentUser.username =
            user.username;


        currentUser.profile_image =
            user.profile_image;


        currentUser.last_seen =
            user.last_seen;


        currentUser.bio =
            user.bio || "";


        // ==================================================
        // SAVE TO LOCAL STORAGE
        // ==================================================

        localStorage.setItem(
            "user",
            JSON.stringify(
                currentUser
            )
        );


    } catch (error) {

        console.error(
            "Profile loading error:",
            error
        );

    }

}

// ==================================================
// PROFILE BUTTON
// ==================================================

const profileBtn =
    document.getElementById(
        "profileBtn"
    );


if (profileBtn) {

    profileBtn.addEventListener(
        "click",
        () => {

            showPage(
                "profilePage"
            );

        }
    );

}


// ==================================================
// DARK MODE
// ==================================================

const darkModeBtn =
    document.getElementById(
        "darkModeBtn"
    );


function loadDarkMode() {

    const enabled =
        localStorage.getItem(
            "darkMode"
        ) === "true";


    document.body.classList.toggle(
        "dark",
        enabled
    );


    if (darkModeBtn) {

        darkModeBtn.textContent =
            enabled
                ? "Light Mode"
                : "Dark Mode";

    }

}


loadDarkMode();


if (darkModeBtn) {

    darkModeBtn.addEventListener(
        "click",
        () => {

            const enabled =
                document.body.classList.toggle(
                    "dark"
                );


            localStorage.setItem(
                "darkMode",
                enabled
                    ? "true"
                    : "false"
            );


            darkModeBtn.textContent =
                enabled
                    ? "Light Mode"
                    : "Dark Mode";

        }
    );

}


// ==================================================
// SEARCH
// ==================================================

const searchInput =
    document.getElementById(
        "searchInput"
    );

const searchBtn =
    document.getElementById(
        "searchBtn"
    );

const searchHistory =
    document.getElementById(
        "searchHistory"
    );

const searchResults =
    document.getElementById(
        "searchResults"
    );



// ==================================================
// PINNED USERS
// ==================================================

let pinnedUsers = [];


let searches =
    JSON.parse(
        localStorage.getItem(
            "searchHistory"
        )
    ) || [];



function saveSearch(user) {

    const recentUser = {

        id:
            Number(user.id),

        name:
            user.name || "",

        username:
            user.username || "",

        profile_image:
            user.profile_image || null

    };


    // ==================================================
    // LOCAL STORAGE
    // ==================================================

    searches =
        searches.filter(
            item =>
                Number(item.id) !==
                Number(user.id)
        );


    searches.unshift(
        recentUser
    );


    if (searches.length > 15) {

        searches =
            searches.slice(0, 15);

    }


    localStorage.setItem(
        "searchHistory",
        JSON.stringify(searches)
    );


    // ==================================================
    // SERVER
    // ==================================================

    fetch(
        "/api/search-history",
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({

                userId:
                    getUserId(),

                searchedUserId:
                    Number(user.id)

            })

        }
    ).catch(error => {

        console.error(
            "Save search history error:",
            error
        );

    });

}


async function showSearchHistory() {

    if (!searchHistory) {

        return;

    }


    // ==================================================
    // FETCH PINNED USERS FROM SERVER
    // ==================================================

    try {

        const pinnedResponse =
            await fetch(
                `/api/pinned-users/${getUserId()}`
            );


        if (pinnedResponse.ok) {

            const pinnedResult =
                await pinnedResponse.json();


            if (
                pinnedResult.success &&
                Array.isArray(pinnedResult.pinned)
            ) {

                pinnedUsers =
                    pinnedResult.pinned.map(
                        p =>
                            Number(
                                p.pinned_user_id
                            )
                    );

            }

        }

    } catch (error) {

        console.error(
            "Load pinned users error:",
            error
        );

    }


    // ==================================================
    // CLEAR
    // ==================================================

    searchHistory.innerHTML =
        "";


    if (searches.length === 0) {

        return;

    }


    // ==================================================
    // SORT — PINNED FIRST
    // ==================================================

    const sortedSearches =
        [...searches].sort((a, b) => {

            const aPinned =
                pinnedUsers.includes(
                    Number(a.id)
                ) ? 1 : 0;

            const bPinned =
                pinnedUsers.includes(
                    Number(b.id)
                ) ? 1 : 0;


            return bPinned - aPinned;

        });


    // ==================================================
    // RENDER EACH ITEM
    // ==================================================

    sortedSearches.forEach(user => {

        const isPinned =
            pinnedUsers.includes(
                Number(user.id)
            );


        const item =
            document.createElement("div");


        item.className =
            "list-item friend-item search-history-item";


        // ==========================================
        // IMAGE
        // ==========================================

        const image =
            document.createElement("img");


        image.className =
            "friend-profile-image";


        image.src =
            user.profile_image ||
            "/default-profile.png";


        image.alt =
            "Profile";


        // ==========================================
        // INFO
        // ==========================================

        const info =
            document.createElement("div");


        info.className =
            "friend-info";


        const name =
            document.createElement("strong");


        name.textContent =
            user.name;


        const username =
            document.createElement("small");


        username.textContent =
            "@" +
            user.username;


        info.appendChild(name);

        info.appendChild(username);


        // ==========================================
        // PIN BADGE
        // ==========================================

        let pinBadge = null;


        if (isPinned) {

            pinBadge =
                document.createElement("div");


            pinBadge.className =
                "pinned-badge";


            pinBadge.innerHTML = `
                <span class="pin-icon">📌</span>
                <span class="pin-label">pinned</span>
            `;

        }


        // ==========================================
        // 3-DOT MENU BUTTON
        // ==========================================

        const menuBtn =
            document.createElement("button");


        menuBtn.className =
            "search-menu-btn";


        menuBtn.type =
            "button";


        menuBtn.textContent =
            "⋮";


        menuBtn.addEventListener(
            "click",
            event => {

                event.preventDefault();
                event.stopPropagation();

                openSearchHistoryMenu(
                    user,
                    menuBtn,
                    isPinned
                );

            }
        );


        // ==========================================
        // ADD TO ITEM
        // ==========================================

        item.appendChild(image);

        item.appendChild(info);


        if (pinBadge) {

            item.appendChild(pinBadge);

        }


        item.appendChild(menuBtn);


        // ==========================================
        // CLICK TO OPEN CHAT
        // ==========================================

        item.addEventListener(
            "click",
            event => {

                if (
                    event.target.closest(
                        ".search-menu-btn"
                    )
                ) {

                    return;

                }


                if (searchInput) {

                    searchInput.value =
                        user.username;

                }


                openChat(user);

            }
        );


        searchHistory.appendChild(item);

    });

}



// ==================================================
// OPEN SEARCH HISTORY MENU
// ==================================================

function openSearchHistoryMenu(
    user,
    button,
    isPinned
) {

    closeSearchHistoryMenu();


    const menu =
        document.createElement("div");


    menu.id =
        "searchHistoryMenu";


    menu.className =
        "search-history-menu";


    // ==========================================
    // DELETE HISTORY BUTTON
    // ==========================================

    const deleteBtn =
        document.createElement("button");


    deleteBtn.type =
        "button";


    deleteBtn.className =
        "search-menu-delete";


    deleteBtn.textContent =
        "Delete History";


    deleteBtn.addEventListener(
        "click",
        async event => {

            event.preventDefault();
            event.stopPropagation();

            closeSearchHistoryMenu();

            await deleteSearchHistoryItem(user);

        }
    );


    // ==========================================
    // PIN / UNPIN BUTTON
    // ==========================================

    const pinBtn =
        document.createElement("button");


    pinBtn.type =
        "button";


    pinBtn.className =
        "search-menu-pin";


    pinBtn.textContent =
        isPinned
            ? "Unpin"
            : "Pin";


    pinBtn.addEventListener(
        "click",
        async event => {

            event.preventDefault();
            event.stopPropagation();

            closeSearchHistoryMenu();

            await togglePinUser(
                user,
                isPinned
            );

        }
    );


    // ==========================================
    // ADD BUTTONS
    // ==========================================

    menu.appendChild(deleteBtn);

    menu.appendChild(pinBtn);


    document.body.appendChild(menu);


    // ==========================================
    // POSITION
    // ==========================================

    const rect =
        button.getBoundingClientRect();


    const menuWidth = 170;

    const menuHeight = 110;


    let left =
        rect.right - menuWidth;


    let top =
        rect.bottom + 5;


    if (left < 5) {

        left = 5;

    }


    if (
        left + menuWidth >
        window.innerWidth - 5
    ) {

        left =
            window.innerWidth -
            menuWidth -
            5;

    }


    if (
        top + menuHeight >
        window.innerHeight - 5
    ) {

        top =
            rect.top -
            menuHeight -
            5;

    }


    if (top < 5) {

        top = 5;

    }


    menu.style.position =
        "fixed";


    menu.style.left =
        `${left}px`;


    menu.style.top =
        `${top}px`;


    menu.style.zIndex =
        "999999";


    // ==========================================
    // CLOSE ON OUTSIDE CLICK
    // ==========================================

    setTimeout(() => {

        document.addEventListener(
            "click",
            function closeOutside(event) {

                if (
                    !menu.contains(event.target) &&
                    event.target !== button
                ) {

                    closeSearchHistoryMenu();

                }

            },
            {
                once: true
            }
        );

    }, 0);

}


// ==================================================
// CLOSE SEARCH HISTORY MENU
// ==================================================

function closeSearchHistoryMenu() {

    const menu =
        document.getElementById(
            "searchHistoryMenu"
        );


    if (menu) {

        menu.remove();

    }

}


// ==================================================
// DELETE SEARCH HISTORY ITEM
// ==================================================

async function deleteSearchHistoryItem(user) {

    const confirmed =
        confirm(
            `Delete @${user.username} from search history?`
        );


    if (!confirmed) {

        return;

    }


    // ==========================================
    // REMOVE FROM LOCAL STORAGE
    // ==========================================

    searches =
        searches.filter(
            item =>
                Number(item.id) !==
                Number(user.id)
        );


    localStorage.setItem(
        "searchHistory",
        JSON.stringify(searches)
    );


    // ==========================================
    // REMOVE FROM PINNED LIST
    // ==========================================

    pinnedUsers =
        pinnedUsers.filter(
            id =>
                id !== Number(user.id)
        );


    // ==========================================
    // REMOVE FROM SERVER
    // ==========================================

    try {

        await fetch(
            "/api/delete-search-history",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    userId:
                        getUserId(),

                    searchedUserId:
                        Number(user.id)

                })

            }
        );

    } catch (error) {

        console.error(
            "Delete search history error:",
            error
        );

    }


    // ==========================================
    // REFRESH
    // ==========================================

    await showSearchHistory();

}


// ==================================================
// TOGGLE PIN USER
// ==================================================

async function togglePinUser(
    user,
    isPinned
) {

    const action =
        isPinned
            ? "unpin"
            : "pin";


    try {

        const response =
            await fetch(
                "/api/pin-user",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        userId:
                            getUserId(),

                        pinnedUserId:
                            Number(user.id),

                        action:
                            action

                    })

                }
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            alert(
                result.message ||
                "Failed to update pin."
            );

            return;

        }


        // ==========================================
        // UPDATE LOCAL PINNED LIST
        // ==========================================

        if (action === "pin") {

            if (
                !pinnedUsers.includes(
                    Number(user.id)
                )
            ) {

                pinnedUsers.push(
                    Number(user.id)
                );

            }

        } else {

            pinnedUsers =
                pinnedUsers.filter(
                    id =>
                        id !== Number(user.id)
                );

        }


        // ==========================================
        // REFRESH
        // ==========================================

        await showSearchHistory();

    } catch (error) {

        console.error(
            "Toggle pin error:",
            error
        );

        alert(
            "Unable to connect to server."
        );

    }

}








// ==================================================
// SEARCH USER
// ==================================================

async function searchUser() {

    if (
        !searchInput ||
        !searchResults
    ) {

        return;

    }


    const username =
        searchInput.value.trim(); 
        
    const enter=document.getElementById('enter') ;   
  

    if (!username) {

      enter.innerText="Enter    username first" ;
        
        return;

    }


    try {

        const response =
            await fetch(
                `/api/search/${encodeURIComponent(
                    username
                )}`
            );


        const result =
            await response.json();


        searchResults.innerHTML =
            "";


        if (
            !response.ok ||
            !result.success ||
            !Array.isArray(result.users) ||
            result.users.length === 0
        ) {

            const empty =
                document.createElement(
                    "div"
                );


            empty.className =
                "list-item";


            empty.textContent =
                "User not found.";


            searchResults.appendChild(
                empty
            );


            return;

        }


        result.users.forEach(user => {

            if (
                Number(user.id) ===
                getUserId()
            ) {

                return;

            }


            saveSearch(user);


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "list-item friend-item";


            const image =
                document.createElement(
                    "img"
                );


            image.className =
                "friend-profile-image";


            image.src =
                user.profile_image ||
                "/default-profile.png";


            image.alt =
                "Profile";


            const info =
                document.createElement(
                    "div"
                );


            info.className =
                "friend-info";


            const name =
                document.createElement(
                    "strong"
                );


            name.textContent =
                user.name;


            const usernameElement =
                document.createElement(
                    "small"
                );


            usernameElement.textContent =
                "@" +
                user.username;


            const addButton =
                document.createElement(
                    "button"
                );


            addButton.className =
                "add-friend-btn";


            addButton.type =
                "button";


            addButton.textContent =
                "Add Friend";


            addButton.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    event.stopPropagation();

                    addFriend(
                        user.id
                    );

                }
            );


            info.appendChild(name);

            info.appendChild(
                usernameElement
            );

            info.appendChild(
                addButton
            );


            item.appendChild(image);

            item.appendChild(info);


            item.addEventListener(
                "click",
                () => {

                    openChat(user);

                }
            );


            searchResults.appendChild(
                item
            );

        });


        showSearchHistory();


    } catch (error) {

        console.error(
            "Search error:",
            error
        );


        alert(
            "Unable to connect to server."
        );

    }

}


if (searchBtn) {

    searchBtn.addEventListener(
        "click",
        searchUser
    );

}


if (searchInput) {

    searchInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                searchUser();

            }

        }
    );

}

if (searchInput) {

    searchInput.addEventListener(
        "input",
        () => {

            searchUser();

        }
    );

}



// ==================================================
// OPEN CHAT
// ==================================================


async function openChat(user) {

    if (!user) {
        return;
    }



    const desktopChatArea =
    document.getElementById("desktopChatArea");

const noChatsMessage =
    document.getElementById("noChatsMessage");

if (desktopChatArea) {
    desktopChatArea.classList.add(
        "desktop-chat-open"
    );
}

if (noChatsMessage) {
    noChatsMessage.style.display =
        "none";
}


    if (
        Number(user.id) ===
        getUserId()
    ) {
        return;
    }


    // =========================================
    // CHAT MODE ON
    // =========================================

    document.body.classList.add(
        "chat-mode"
    );


    // =========================================
    // CURRENT CHAT USER
    // =========================================

    currentChatUser = {

        id:
            Number(user.id),

        name:
            user.name || "",

        username:
            user.username || "",

        profile_image:
            user.profile_image || null

    };


    // =========================================
    // CHAT USER NAME
    // =========================================

    if (chatUserName) {

        chatUserName.textContent =
            currentChatUser.name;

    }


    if (chatUserName) {

    chatUserName.style.cursor =
        "pointer";

    chatUserName.onclick = () => {

        openChatUserProfile(
            currentChatUser
        );

    };

}


    // =========================================
    // CHAT USER IMAGE
    // =========================================

    if (chatUserImage) {

        chatUserImage.src =
            currentChatUser.profile_image ||
            "/default-profile.png";



const chatProfilePageImage =
    document.getElementById(
        "chatProfilePageImage"
    );


if (chatProfilePageImage) {

    chatProfilePageImage.src =
        currentChatUser.profile_image ||
        "/default-profile.png";

}




const chatProfilePageName =
    document.getElementById(
        "chatProfilePageName"
    );


const chatProfilePageUsername =
    document.getElementById(
        "chatProfilePageUsername"
    );


const chatProfilePageBio =
    document.getElementById(
        "chatProfilePageBio"
    );


if (chatProfilePageName) {

    chatProfilePageName.textContent =
        currentChatUser.name ||
        "User";

}


if (chatProfilePageUsername) {

    chatProfilePageUsername.textContent =
        "@" +
        (
            currentChatUser.username ||
            ""
        );

}


if (chatProfilePageBio) {

    chatProfilePageBio.textContent =
        currentChatUser.bio ||
        "No bio yet";

}



        // =====================================
        // CLICK PROFILE IMAGE
        // =====================================

        chatUserImage.onclick = () => {

            showUserProfilePopup(
                currentChatUser
            );

        };

    }


    // =========================================
    // TYPING INDICATOR
    // =========================================

    if (typingIndicator) {

        typingIndicator.textContent =
            "";

    }


    // =========================================
    // ONLINE STATUS
    // =========================================

    updateOnlineStatus(
        currentChatUser.id
    );


    // =========================================
    // HIDE ALL PAGES
    // =========================================

    pages.forEach(page => {

        page.classList.remove(
            "active"
        );

    });


    // =========================================
    // SHOW CHAT
    // =========================================

    if (chatSection) {

        chatSection.classList.add(
            "active"
        );

    }



    // ==========================================
// FETCH BLOCK STATUS
// ==========================================

try {

    const blockRes =
        await fetch(
            `/api/is-blocked/${getUserId()}/${Number(user.id)}`
        );


    const blockData =
        await blockRes.json();


    currentUserBlockedChatUser =
        !!(blockData.success && blockData.blocked);

} catch (error) {

    console.error(
        "Fetch block status error:",
        error
    );

    currentUserBlockedChatUser = false;

}


// ==========================================
// UPDATE BLOCKED BANNER
// ==========================================

updateBlockedBanner();


// ==========================================
// RESET CHAT SEARCH
// ==========================================

const searchBar =
    document.getElementById("chatSearchBar");

if (searchBar) {
    searchBar.style.display = "none";
}


const searchInputEl =
    document.getElementById("chatSearchInput");

if (searchInputEl) {
    searchInputEl.value = "";
}


chatSearchActive = false;


// ==========================================
// LOAD MESSAGES
// ==========================================
















    // =========================================
    // LOAD MESSAGES
    // =========================================

    await loadMessages();

}


async function loadMessages() {

    if (
        !currentChatUser ||
        !messages
    ) {
        return;
    }

    try {

        const userId =
            Number(getUserId());

        const friendId =
            Number(currentChatUser.id);


        // ==================================================
        // CLEAR OLD MESSAGES FROM UI
        // ==================================================

        messages.innerHTML = "";


        // ==================================================
        // LOCAL PHONE MESSAGE KEY
        // ==================================================

        const localKey =
            `phone_messages_${userId}_${friendId}`;


        // ==================================================
        // LOAD LOCAL PHONE MESSAGES
        // ==================================================

        let localMessages = [];

        try {

            localMessages =
                JSON.parse(
                    localStorage.getItem(localKey) || "[]"
                );

        } catch (error) {

            console.error(
                "Local message load error:",
                error
            );

            localMessages = [];

        }


        // ==================================================
        // LOAD DATABASE TEXT MESSAGES
        // ==================================================

        const textResponse =
            await fetch(
                `/api/messages/${userId}/${friendId}`
            );


        let databaseMessages = [];


        if (textResponse.ok) {

            const textResult =
                await textResponse.json();


            if (
                textResult.success &&
                Array.isArray(textResult.messages)
            ) {

                databaseMessages =
                    textResult.messages;

            }

        }


        // ==================================================
        // LOAD MEDIA MESSAGES
        // ==================================================

        const mediaResponse =
            await fetch(
                `/api/media-messages/${userId}/${friendId}`
            );


        let mediaMessages = [];


        if (mediaResponse.ok) {

            const mediaResult =
                await mediaResponse.json();


            if (
                mediaResult.success &&
                Array.isArray(mediaResult.messages)
            ) {

                mediaMessages =
                    mediaResult.messages;

            }

        }


        // ==================================================
        // COMBINE ALL MESSAGES
        // ==================================================

        const allMessages = [];


        // ==================================================
        // DATABASE TEXT
        // ==================================================

        databaseMessages.forEach(
            msg => {

                allMessages.push({

                    ...msg,

                    messageType:
                        "text"

                });

            }
        );


        // ==================================================
        // LOCAL PHONE TEXT
        // ==================================================

        localMessages.forEach(
            msg => {

                allMessages.push({

                    ...msg,

                    messageType:
                        "text"

                });

            }
        );


        // ==================================================
        // MEDIA
        // ==================================================

        mediaMessages.forEach(
            msg => {

                allMessages.push({

                    ...msg,

                    messageType:
                        "media"

                });

            }
        );


        // ==================================================
        // REMOVE DUPLICATES
        // ==================================================

        const uniqueMessages = [];

        const seen = new Set();


        allMessages.forEach(
            msg => {

                const id =
                    msg.id ??
                    msg.messageId;


                if (
                    id !== null &&
                    id !== undefined
                ) {

                    const key =
                        `${msg.messageType}_${id}`;


                    if (
                        seen.has(key)
                    ) {

                        return;

                    }


                    seen.add(key);

                }


                uniqueMessages.push(
                    msg
                );

            }
        );


        // ==================================================
        // SORT BY TIME
        // ==================================================

        uniqueMessages.sort(
            (a, b) => {

                const timeA =
                    new Date(
                        a.created_at ??
                        a.createdAt ??
                        0
                    ).getTime();


                const timeB =
                    new Date(
                        b.created_at ??
                        b.createdAt ??
                        0
                    ).getTime();


                return timeA - timeB;

            }
        );


        // ==================================================
        // DISPLAY MESSAGES
        // ==================================================

        uniqueMessages.forEach(
            msg => {

                const senderId =
                    Number(
                        msg.sender_id ??
                        msg.senderId
                    );


                const type =
                    senderId === userId
                        ? "sent"
                        : "received";


                // ==================================================
                // TEXT MESSAGE
                // ==================================================

                if (
                    msg.messageType ===
                    "text"
                ) {

                    const text =
                        msg.message ??
                        msg.text ??
                        "";


                    if (!text) {
                        return;
                    }


                    addMessage(
                        text,
                        type,
                        msg.id
                    );


                    return;

                }


                // ==================================================
                // MEDIA MESSAGE
                // ==================================================

                if (
                    msg.messageType ===
                    "media"
                ) {

                    const mediaWrapper =
                        document.createElement(
                            "div"
                        );


                    mediaWrapper.className =
                        `message ${type} media-message`;


                    const mediaId =
                        Number(
                            msg.id ??
                            msg.media_id
                        );


                    if (mediaId) {

                        mediaWrapper.dataset.mediaId =
                            String(mediaId);

                    }


                    // ==================================================
                    // IMAGE
                    // ==================================================

                    if (
                        msg.media_type ===
                        "image"
                    ) {

                        const image =
                            document.createElement(
                                "img"
                            );


                        image.src =
                            msg.file_url;


                        image.alt =
                            msg.file_name ||
                            "Photo";


                        image.className =
                            "chat-image";


                        image.loading =
                            "lazy";


                        image.addEventListener(
                            "click",
                            () => {

                                window.open(
                                    msg.file_url,
                                    "_blank"
                                );

                            }
                        );


                        mediaWrapper.appendChild(
                            image
                        );

                    }


                    // ==================================================
                    // VIDEO
                    // ==================================================

                    else if (
                        msg.media_type ===
                        "video"
                    ) {

                        const video =
                            document.createElement(
                                "video"
                            );


                        video.src =
                            msg.file_url;


                        video.controls =
                            true;


                        video.preload =
                            "metadata";


                        video.className =
                            "chat-video";


                        mediaWrapper.appendChild(
                            video
                        );

                    }


                    messages.appendChild(
                        mediaWrapper
                    );

                }

            }
        );


        // ==================================================
        // SCROLL TO BOTTOM
        // ==================================================

        messages.scrollTop =
            messages.scrollHeight;


    } catch (error) {

        console.error(
            "Load messages error:",
            error
        );

    }

}

function addMessage(
    text,
    type,
    messageId = null
) {

    if (!messages) {
        return;
    }

    const message =
        document.createElement("div");

    message.className =
        "message " + type;

    // ==========================================
    // MESSAGE ID
    // ==========================================

    if (messageId) {

        message.dataset.messageId =
            String(messageId);

    }

    // ==========================================
    // MESSAGE TEXT
    // ==========================================

    message.textContent =
        text;

    // ==========================================
    // ADD TO CHAT
    // ==========================================

    messages.appendChild(
        message
    );

    // ==========================================
    // SCROLL
    // ==========================================

    messages.scrollTop =
        messages.scrollHeight;
}




// ==================================================
// UPDATE BLOCKED BANNER
// ==================================================

function updateBlockedBanner() {

    // Remove existing

    const existingBanner =
        document.getElementById(
            "blockedBanner"
        );


    if (existingBanner) {
        existingBanner.remove();
    }


    if (
        !currentUserBlockedChatUser ||
        !currentChatUser
    ) {
        return;
    }


    // Add new banner

    const banner =
        document.createElement("div");


    banner.id =
        "blockedBanner";


    banner.className =
        "blocked-banner";


    banner.textContent =
        `🚫 You have blocked ${currentChatUser.name}. They cannot see your online status and their new messages won't reach you.`;


    const chatSectionEl =
        document.getElementById("chatSection");


    const chatHeaderEl =
        chatSectionEl
            ? chatSectionEl.querySelector(
                ".chat-header"
            )
            : null;


    if (chatHeaderEl) {

        chatHeaderEl.insertAdjacentElement(
            "afterend",
            banner
        );

    }

}


// ==================================================
// OPEN CHAT CONTEXT MENU
// ==================================================

async function openChatContextMenu(
    x,
    y
) {

    if (!currentChatUser) {
        return;
    }


    closeChatContextMenu();


    // ==========================================
    // CHECK BLOCK STATUS
    // ==========================================

    try {

        const res =
            await fetch(
                `/api/is-blocked/${getUserId()}/${Number(currentChatUser.id)}`
            );


        const data =
            await res.json();


        currentUserBlockedChatUser =
            !!(data.success && data.blocked);

    } catch (error) {

        console.error(
            "Block status check error:",
            error
        );

    }


    // ==========================================
    // CREATE MENU
    // ==========================================

    chatContextMenu =
        document.createElement("div");


    chatContextMenu.id =
        "chatContextMenu";


    chatContextMenu.className =
        "chat-context-menu";


    // ==========================================
    // OPTION 1 — DELETE THIS CHAT
    // ==========================================

    const deleteMineBtn =
        document.createElement("button");


    deleteMineBtn.type =
        "button";


    deleteMineBtn.className =
        "chat-context-delete";


    deleteMineBtn.textContent =
        "Delete this chat";


    deleteMineBtn.addEventListener(
        "click",
        async event => {

            event.preventDefault();
            event.stopPropagation();

            closeChatContextMenu();

            await deleteChatForMeFromMenu();

        }
    );


    // ==========================================
    // OPTION 2 — DELETE FOR EVERYONE
    // ==========================================

    const deleteAllBtn =
        document.createElement("button");


    deleteAllBtn.type =
        "button";


    deleteAllBtn.className =
        "chat-context-delete";


    deleteAllBtn.textContent =
        "Delete chat for everyone";


    deleteAllBtn.addEventListener(
        "click",
        async event => {

            event.preventDefault();
            event.stopPropagation();

            closeChatContextMenu();

            await deleteChatForEveryoneFromMenu();

        }
    );


    // ==========================================
    // OPTION 3 — BLOCK / UNBLOCK
    // ==========================================

    const blockBtn =
        document.createElement("button");


    blockBtn.type =
        "button";


    const chatName =
        currentChatUser.name ||
        currentChatUser.username ||
        "User";


    if (currentUserBlockedChatUser) {

        blockBtn.className =
            "chat-context-unblock";


        blockBtn.textContent =
            `Unblock ${chatName}`;

    } else {

        blockBtn.className =
            "chat-context-block";


        blockBtn.textContent =
            `Block ${chatName}`;

    }


    blockBtn.addEventListener(
        "click",
        async event => {

            event.preventDefault();
            event.stopPropagation();

            closeChatContextMenu();

            await toggleBlockFromMenu();

        }
    );


    // ==========================================
    // OPTION 4 — SEARCH CHAT
    // ==========================================

    const searchBtn =
        document.createElement("button");


    searchBtn.type =
        "button";


    searchBtn.className =
        "chat-context-search";


    searchBtn.textContent =
        "Search chat";


    searchBtn.addEventListener(
        "click",
        event => {

            event.preventDefault();
            event.stopPropagation();

            closeChatContextMenu();

            openChatSearch();

        }
    );


    // ==========================================
    // ADD BUTTONS
    // ==========================================

    chatContextMenu.appendChild(
        deleteMineBtn
    );

    chatContextMenu.appendChild(
        deleteAllBtn
    );

    chatContextMenu.appendChild(
        blockBtn
    );

    chatContextMenu.appendChild(
        searchBtn
    );


    document.body.appendChild(
        chatContextMenu
    );


    // ==========================================
    // POSITION
    // ==========================================

    const menuWidth = 220;

    const menuHeight = 210;


    let left = x;

    let top = y;


    if (
        left + menuWidth >
        window.innerWidth - 5
    ) {

        left =
            window.innerWidth -
            menuWidth -
            5;

    }


    if (
        top + menuHeight >
        window.innerHeight - 5
    ) {

        top =
            window.innerHeight -
            menuHeight -
            5;

    }


    if (left < 5) left = 5;

    if (top < 5) top = 5;


    chatContextMenu.style.left =
        `${left}px`;


    chatContextMenu.style.top =
        `${top}px`;


    // ==========================================
    // CLOSE ON OUTSIDE CLICK
    // ==========================================

    setTimeout(() => {

        document.addEventListener(
            "click",
            function closeOutside(event) {

                if (
                    !chatContextMenu ||
                    !chatContextMenu.contains(
                        event.target
                    )
                ) {

                    closeChatContextMenu();

                }

            },
            { once: true }
        );

    }, 0);

}


// ==================================================
// CLOSE CHAT CONTEXT MENU
// ==================================================

function closeChatContextMenu() {

    if (chatContextMenu) {

        chatContextMenu.remove();

        chatContextMenu = null;

    }

}


// ==================================================
// DELETE CHAT FOR ME (from menu)
// ==================================================

async function deleteChatForMeFromMenu() {

    if (!currentChatUser) return;


    const confirmed =
        confirm(
            "Delete this chat for you?"
        );


    if (!confirmed) return;


    try {

        const response =
            await fetch(
                "/api/delete-chat-for-me",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        userId:
                            Number(getUserId()),

                        chatUserId:
                            Number(currentChatUser.id)
                    })

                }
            );


        const result =
            await response.json();


        if (!response.ok || !result.success) {

            alert(
                result.message ||
                "Failed to delete chat."
            );

            return;

        }


        // Remove local storage

        const localKey =
            `phone_messages_${getUserId()}_${currentChatUser.id}`;

        localStorage.removeItem(localKey);


        // Clear UI

        if (messages) {
            messages.innerHTML = "";
        }


        alert("Chat deleted for you.");

    } catch (error) {

        console.error(
            "Delete chat for me error:",
            error
        );

        alert("Unable to connect to server.");

    }

}


// ==================================================
// DELETE CHAT FOR EVERYONE (from menu)
// ==================================================

async function deleteChatForEveryoneFromMenu() {

    if (!currentChatUser) return;


    const confirmed =
        confirm(
            "⚠️ This will permanently delete this chat for BOTH of you. Continue?"
        );


    if (!confirmed) return;


    const finalConfirm =
        confirm(
            "Are you absolutely sure? This cannot be undone."
        );


    if (!finalConfirm) return;


    try {

        const response =
            await fetch(
                "/api/delete-chat-for-everyone",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        userId:
                            Number(getUserId()),

                        chatUserId:
                            Number(currentChatUser.id)
                    })

                }
            );


        const result =
            await response.json();


        if (!response.ok || !result.success) {

            alert(
                result.message ||
                "Failed to delete chat."
            );

            return;

        }


        // Remove local storage

        const localKey =
            `phone_messages_${getUserId()}_${currentChatUser.id}`;

        localStorage.removeItem(localKey);


        // Clear UI

        if (messages) {
            messages.innerHTML = "";
        }


        alert("Chat deleted for everyone.");

    } catch (error) {

        console.error(
            "Delete chat for everyone error:",
            error
        );

        alert("Unable to connect to server.");

    }

}


// ==================================================
// TOGGLE BLOCK (from menu)
// ==================================================

async function toggleBlockFromMenu() {

    if (!currentChatUser) return;


    const chatName =
        currentChatUser.name ||
        currentChatUser.username ||
        "this user";


    if (currentUserBlockedChatUser) {

        // ==================================
        // UNBLOCK
        // ==================================

        try {

            const response =
                await fetch(
                    "/api/unblock-user",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            userId:
                                Number(getUserId()),

                            blockedUserId:
                                Number(currentChatUser.id)
                        })

                    }
                );


            const result =
                await response.json();


            if (!response.ok || !result.success) {

                alert(
                    "Failed to unblock."
                );

                return;

            }


            currentUserBlockedChatUser =
                false;


            updateBlockedBanner();


            alert(
                `You unblocked ${chatName}.`
            );

        } catch (error) {

            console.error(
                "Unblock error:",
                error
            );

            alert("Unable to connect to server.");

        }

    } else {

        // ==================================
        // BLOCK
        // ==================================

        const confirmed =
            confirm(
                `Block ${chatName}? They won't be able to reach you.`
            );


        if (!confirmed) return;


        try {

            const response =
                await fetch(
                    "/api/block-user",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            userId:
                                Number(getUserId()),

                            blockedUserId:
                                Number(currentChatUser.id)
                        })

                    }
                );


            const result =
                await response.json();


            if (!response.ok || !result.success) {

                alert(
                    "Failed to block."
                );

                return;

            }


            currentUserBlockedChatUser =
                true;


            updateBlockedBanner();


            alert(
                `You blocked ${chatName}.`
            );

        } catch (error) {

            console.error(
                "Block error:",
                error
            );

            alert("Unable to connect to server.");

        }

    }

}


// ==================================================
// OPEN CHAT SEARCH
// ==================================================

function openChatSearch() {

    const searchBar =
        document.getElementById("chatSearchBar");


    if (!searchBar) return;


    searchBar.style.display = "flex";


    const input =
        document.getElementById("chatSearchInput");


    if (input) {

        input.value = "";

        input.focus();

    }


    chatSearchActive = true;

}


// ==================================================
// CLOSE CHAT SEARCH
// ==================================================

function closeChatSearch() {

    const searchBar =
        document.getElementById("chatSearchBar");


    if (searchBar) {

        searchBar.style.display = "none";

    }


    const input =
        document.getElementById("chatSearchInput");


    if (input) {

        input.value = "";

    }


    // Remove highlights

    document
        .querySelectorAll(
            ".message.search-highlight"
        )
        .forEach(el => {

            el.classList.remove(
                "search-highlight"
            );

        });


    chatSearchActive = false;

}


// ==================================================
// PERFORM CHAT SEARCH
// ==================================================

function performChatSearch(query) {

    if (!messages) return;


    // Remove existing highlights

    document
        .querySelectorAll(
            ".message.search-highlight"
        )
        .forEach(el => {

            el.classList.remove(
                "search-highlight"
            );

        });


    const trimmed =
        query.trim().toLowerCase();


    if (!trimmed) {
        return;
    }


    const allMessages =
        messages.querySelectorAll(".message");


    allMessages.forEach(msgEl => {

        const text =
            msgEl.textContent.toLowerCase();


        if (text.includes(trimmed)) {

            msgEl.classList.add(
                "search-highlight"
            );

        }

    });

}


// ==================================================
// SCROLL TO FIRST SEARCH MATCH
// ==================================================

function scrollToFirstMatch() {

    const first =
        messages.querySelector(
            ".message.search-highlight"
        );


    if (first) {

        first.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }

}




// ==================================================
// MESSAGE OPTIONS MENU
// ==================================================

let messageOptionsMenu = null;



// ==================================================
// CREATE MENU
// ==================================================

function createMessageOptionsMenu() {

    if (messageOptionsMenu) {
        return;
    }


    messageOptionsMenu =
        document.createElement("div");


    messageOptionsMenu.className =
        "message-options-menu";


    messageOptionsMenu.innerHTML = `

        <button data-action="copy">
            Copy text
        </button>

        <button data-action="delete">
            Delete text
        </button>

        <button data-action="share">
            Share text
        </button>

        <button data-action="report">
            Report text
        </button>

    `;


    document.body.appendChild(
        messageOptionsMenu
    );


    // ==================================================
    // OPTION CLICK
    // ==================================================

    messageOptionsMenu.addEventListener(
        "click",
        async event => {

            const button =
                event.target.closest(
                    "button"
                );


            if (!button) {
                return;
            }


            const action =
                button.dataset.action;


            if (!selectedMessage) {
                return;
            }


            const text =
                selectedMessage.textContent;


            // ==================================================
            // COPY
            // ==================================================

            if (action === "copy") {

                try {

                    await navigator.clipboard.writeText(
                        text
                    );

                    console.log(
                        "Message copied"
                    );

                } catch (error) {

                    console.error(
                        "Copy error:",
                        error
                    );

                }

            }

        



            if (action === "delete") {

    await deleteSelectedMessage();

}

            // ==================================================
            // SHARE
            // ==================================================

            if (action === "share") {

                if (
                    navigator.share
                ) {

                    try {

                        await navigator.share({

                            text: text

                        });

                    } catch (error) {

                        console.log(
                            "Share cancelled"
                        );

                    }

                } else {

                    alert(
                        "Sharing is not supported on this device."
                    );

                }

            }


            // ==================================================
            // REPORT
            // ==================================================

            if (action === "report") {

                alert(
                    "Report system will be added later."
                );

            }


            hideMessageOptions();

        }
    );

}


// ==================================================
// SHOW MENU
// ==================================================

function showMessageOptions(
    message,
    x,
    y
) {

    createMessageOptionsMenu();


    selectedMessage =
        message;


    messageOptionsMenu.style.display =
        "flex";


    // Prevent menu from going outside screen

    const menuWidth = 180;

    const menuHeight = 200;


    let left =
        x;

    let top =
        y;


    if (
        left + menuWidth >
        window.innerWidth
    ) {

        left =
            window.innerWidth -
            menuWidth -
            10;

    }


    if (
        top + menuHeight >
        window.innerHeight
    ) {

        top =
            window.innerHeight -
            menuHeight -
            10;

    }


    messageOptionsMenu.style.left =
        left + "px";


    messageOptionsMenu.style.top =
        top + "px";

}


// ==================================================
// HIDE MENU
// ==================================================

function hideMessageOptions() {

    if (
        messageOptionsMenu
    ) {

        messageOptionsMenu.style.display =
            "none";

    }

    selectedMessage =
        null;

}


// ==================================================
// ADD LONG PRESS + RIGHT CLICK
// ==================================================

function enableMessageOptions(
    message
) {

    let pressTimer = null;

    let longPressTriggered =
        false;


    // ==================================================
    // MOBILE — LONG PRESS
    // ==================================================

    message.addEventListener(
        "touchstart",
        event => {

            longPressTriggered =
                false;


            const touch =
                event.touches[0];


            pressTimer =
                setTimeout(
                    () => {

                        longPressTriggered =
                            true;


                        showMessageOptions(
                            message,
                            touch.clientX,
                            touch.clientY
                        );

                    },
                    700
                );

        },
        {
            passive: true
        }
    );


    message.addEventListener(
        "touchend",
        () => {

            clearTimeout(
                pressTimer
            );

        }
    );


    message.addEventListener(
        "touchmove",
        () => {

            clearTimeout(
                pressTimer
            );

        }
    );


    // ==================================================
    // PC — RIGHT CLICK
    // ==================================================

    message.addEventListener(
        "contextmenu",
        event => {

            event.preventDefault();


            showMessageOptions(
                message,
                event.clientX,
                event.clientY
            );

        }
    );

}


// ==================================================
// CLOSE MENU WHEN CLICKING OUTSIDE
// ==================================================

document.addEventListener(
    "click",
    event => {

        if (
            messageOptionsMenu &&
            !messageOptionsMenu.contains(
                event.target
            )
        ) {

            hideMessageOptions();

        }

    }
);




// ==================================================
// SEND MESSAGE
// ==================================================

function sendMessage() {

    if (
        !messageInput ||
        !currentChatUser
    ) {

        return;

    }


    const message =
        messageInput.value.trim();


    if (!message) {

        return;

    }


    // ==================================================
    // SEND MESSAGE TO SERVER
    // ==================================================

    socket.emit(
        "send-message",
        {

            senderId:
                getUserId(),

            receiverId:
                Number(
                    currentChatUser.id
                ),

            message:
                message

        }
    );


    // ==================================================
    // CLEAR INPUT
    // ==================================================

    messageInput.value =
        "";


    // ==================================================
    // STOP TYPING
    // ==================================================

    stopTyping();


    // ==================================================
    // KEEP KEYBOARD OPEN
    // ==================================================

    setTimeout(
        () => {

            messageInput.focus();

        },
        0
    );

}


// ==================================================
// SEND BUTTON
// ==================================================

if (sendBtn) {

    sendBtn.addEventListener(
        "click",
        sendMessage
    );

}


// ==================================================
// ENTER TO SEND
// ==================================================

if (messageInput) {

    messageInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                sendMessage();

            }

        }
    );

}





// ==================================================
// TYPING
// ==================================================

function startTyping() {

    if (!currentChatUser) {

        return;

    }


    if (!isTyping) {

        isTyping =
            true;


        socket.emit(
            "typing",
            {

                senderId:
                    getUserId(),

                receiverId:
                    Number(
                        currentChatUser.id
                    )

            }
        );

    }


    clearTimeout(
        typingTimeout
    );


    typingTimeout =
        setTimeout(
            stopTyping,
            1500
        );

}


function stopTyping() {




    socket.emit(
    "stop-typing",
    {
        senderId: getUserId(),
        receiverId: Number(currentChatUser.id)
    }
);

    if (!currentChatUser) {

        return;

    }


    clearTimeout(
        typingTimeout
    );


    if (isTyping) {

        socket.emit(
            "stop-typing",
            {

                senderId:
                    getUserId(),

                receiverId:
                    Number(
                        currentChatUser.id
                    )

            }
        );

    }


    isTyping =
        false;


    if (typingIndicator) {

        typingIndicator.textContent =
            "";

    }

}


if (messageInput) {

    messageInput.addEventListener(
        "input",
        startTyping
    );

}


// ==================================================
// RECEIVE MESSAGE
// ==================================================
// ==================================================
// RECEIVE MESSAGE
// ==================================================

socket.on(
    "receive-message",
    data => {

        if (!data) {
            return;
        }


        // ==================================================
        // USER IDS
        // ==================================================

        const senderId =
            Number(
                data.senderId ??
                data.sender_id
            );

        const receiverId =
            Number(
                data.receiverId ??
                data.receiver_id
            );

        const myId =
            Number(
                getUserId()
            );


        if (
            !senderId ||
            !receiverId ||
            !myId
        ) {

            return;

        }


        // ==================================================
        // MESSAGE SAVE TYPES
        // ==================================================

        const senderSaveType =
            data.senderSaveType ||
            "database";

        const receiverSaveType =
            data.receiverSaveType ||
            "database";


        // ==================================================
        // CHECK WHETHER MESSAGE SHOULD BE SAVED LOCALLY
        // ==================================================

        /*
         * যদি দুজনের mode-ই phone হয়,
         * তাহলে server database-এ message save করে না।
         *
         * তাই frontend localStorage-এ save করবে।
         */

        const shouldSaveLocally =

            senderSaveType === "phone" &&
            receiverSaveType === "phone";


        // ==================================================
        // MESSAGE TEXT
        // ==================================================

        const message =
            String(
                data.message ||
                ""
            ).trim();


        if (!message) {

            return;

        }


        // ==================================================
        // LOCAL STORAGE KEY
        // ==================================================

        const otherUserId =
            senderId === myId
                ? receiverId
                : senderId;


        const localKey =
            `phone_messages_${myId}_${otherUserId}`;


        // ==================================================
        // SAVE TO LOCAL STORAGE
        // ==================================================

        if (
            shouldSaveLocally
        ) {

            let localMessages = [];


            try {

                localMessages =
                    JSON.parse(
                        localStorage.getItem(
                            localKey
                        ) || "[]"
                    );

            } catch (error) {

                console.error(
                    "Local message parse error:",
                    error
                );

                localMessages = [];

            }


            // ==================================================
            // CREATE LOCAL MESSAGE
            // ==================================================

            const localMessage = {

                id:
                    data.id ??
                    `local_${Date.now()}_${Math.random()}`,

                senderId,

                receiverId,

                message,

                senderSaveType,

                receiverSaveType,

                created_at:
                    data.created_at ??
                    new Date().toISOString()

            };


            // ==================================================
            // ADD MESSAGE
            // ==================================================

            localMessages.push(
                localMessage
            );


            // ==================================================
            // SAVE
            // ==================================================

            try {

                localStorage.setItem(
                    localKey,
                    JSON.stringify(
                        localMessages
                    )
                );

            } catch (error) {

                console.error(
                    "Local message save error:",
                    error
                );

            }

        }


        // ==================================================
        // CHECK CURRENT CHAT
        // ==================================================

        if (
            currentChatUser
        ) {

            const chatId =
                Number(
                    currentChatUser.id
                );


            const sameChat =

                (
                    senderId === myId &&
                    receiverId === chatId
                )

                ||

                (
                    senderId === chatId &&
                    receiverId === myId
                );


            // ==================================================
            // DISPLAY MESSAGE
            // ==================================================

            if (
                sameChat
            ) {

                addMessage(
                    message,
                    senderId === myId
                        ? "sent"
                        : "received",
                    data.id
                );


                // ==================================================
                // STOP TYPING INDICATOR
                // ==================================================

                if (
                    typingIndicator
                ) {

                    typingIndicator.textContent =
                        "";

                }

            }

        }


        // ==================================================
        // UPDATE CHAT LIST
        // ==================================================

        loadChats();

        loadFriends();


        // ==================================================
        // UPDATE NOTIFICATIONS
        // ==================================================

        loadNotifications();

    }
);




// ==================================================
// RECEIVE PHOTO / VIDEO
// ==================================================

socket.on(
    "receive-media-message",
    media => {

        console.log(
            "Media received:",
            media
        );


        // ==================================================
        // CHECK CURRENT CHAT
        // ==================================================

        if (!currentChatUser) {
            return;
        }


        const senderId =
            Number(media.senderId);

        const receiverId =
            Number(media.receiverId);


        const currentUserId =
            Number(currentUser.id);

        const currentChatUserId =
            Number(currentChatUser.id);


        const belongsToCurrentChat =

            (
                senderId === currentUserId &&
                receiverId === currentChatUserId
            )

            ||

            (
                senderId === currentChatUserId &&
                receiverId === currentUserId
            );


        if (!belongsToCurrentChat) {

            return;

        }


        // ==================================================
        // DISPLAY MEDIA
        // ==================================================

        displayMediaMessage(media);

    }
);



// ==================================================
// CHAT DELETED FOR EVERYONE
// ==================================================

socket.on(
    "chat-deleted-for-everyone",
    data => {

        if (!data) {
            return;
        }

        const deletedChatUserId =
            Number(data.chatUserId);

        const myId =
            Number(getUserId());

        if (
            !deletedChatUserId ||
            !myId
        ) {
            return;
        }


        // ==============================================
        // REMOVE LOCAL CHAT DATA
        // ==============================================

        const localKey =
            `phone_messages_${myId}_${deletedChatUserId}`;

        localStorage.removeItem(
            localKey
        );


        // ==============================================
        // IF THIS CHAT IS CURRENTLY OPEN
        // ==============================================

        if (currentChatUser) {

            const currentChatUserId =
                Number(
                    currentChatUser.id
                );

            if (
                currentChatUserId ===
                deletedChatUserId
            ) {

                if (messages) {
                    messages.innerHTML = "";
                }

                currentChatUser = null;

                document.body.classList.remove(
                    "chat-mode"
                );

                if (
                    typeof showPage ===
                    "function"
                ) {
                    showPage(
                        "chatsPage"
                    );
                }

            }

        }


        // ==============================================
        // UPDATE CHAT LIST
        // ==============================================

        if (
            typeof loadChats ===
            "function"
        ) {
            loadChats();
        }

    }
);




// ==================================================
// MESSAGE SEND FAILED
// ==================================================

socket.on(
    "message-send-failed",
    data => {

        if (!data) {
            return;
        }


        alert(
            data.message ||
            "Unable to send message."
        );


        // Input-এর message আবার রেখে দাও
        if (messageInput) {

            messageInput.focus();

        }

    }
);




////


socket.on(
    "chat-deleted",
    data => {

        if (!data) {
            return;
        }

        const deletedUserId =
            Number(data.chatUserId);

        // যদি বর্তমানে ওই chat খোলা থাকে
        if (
            currentChatUser &&
            Number(currentChatUser.id) ===
            deletedUserId
        ) {

            currentChatUser = null;

            if (messages) {
                messages.innerHTML = "";
            }

            if (chatSection) {
                chatSection.classList.remove(
                    "active"
                );
            }

            showPage(
                "friendsSection"
            );

        }

        // Chat list refresh
        loadChats();

    }
);






// ==================================================
// DISPLAY MEDIA MESSAGE
// ==================================================



function displayMediaMessage(media) {

    const messageContainer =
        document.querySelector(
            "#messages"
        );


    if (!messageContainer) {

        console.error(
            "Messages container not found."
        );

        return;

    }


    // ==================================================
    // CREATE MESSAGE CONTAINER
    // ==================================================

    const messageDiv =
        document.createElement("div");


    messageDiv.className =
        "message media-message";


    // ==================================================
    // SENT / RECEIVED
    // ==================================================

    if (
        Number(media.senderId) ===
        Number(currentUser.id)
    ) {

        messageDiv.classList.add(
            "sent"
        );

    } else {

        messageDiv.classList.add(
            "received"
        );

    }


    // ==================================================
    // MEDIA ID
    // ==================================================

    if (media.id) {

        messageDiv.dataset.mediaId =
            String(media.id);

    }


    console.log(
        "MEDIA MESSAGE CREATED:",
        {
            id: media.id,
            mediaId:
                messageDiv.dataset.mediaId,
            type:
                media.mediaType
        }
    );


    // ==================================================
    // IMAGE
    // ==================================================

    if (
        media.mediaType === "image"
    ) {

        const image =
            document.createElement("img");


        image.src =
            media.fileUrl;


        image.alt =
            media.fileName ||
            "Photo";


        image.className =
            "chat-image";


        image.style.cursor =
            "pointer";


        // ==================================================
        // OPEN FULL IMAGE
        // ==================================================

        image.addEventListener(
            "click",
            () => {

                window.open(
                    media.fileUrl,
                    "_blank"
                );

            }
        );


        messageDiv.appendChild(
            image
        );

    }


    // ==================================================
    // VIDEO
    // ==================================================

    else if (
        media.mediaType === "video"
    ) {

        const video =
            document.createElement("video");


        video.src =
            media.fileUrl;


        video.className =
            "chat-video";


        video.controls =
            true;


        video.preload =
            "metadata";


        messageDiv.appendChild(
            video
        );

    }


    // ==================================================
    // UNKNOWN MEDIA TYPE
    // ==================================================

    else {

        console.error(
            "Unknown media type:",
            media.mediaType
        );

        return;

    }


    // ==================================================
    // ADD TO CHAT
    // ==================================================

    messageContainer.appendChild(
        messageDiv
    );


    // ==================================================
    // SCROLL TO BOTTOM
    // ==================================================

    messageContainer.scrollTop =
        messageContainer.scrollHeight;

}



// ==================================================
// RECEIVE NOTIFICATION
// ==================================================

socket.on(
    "new-notification",
    data => {

        if (!data) {

            return;

        }


        const receiverId =
            Number(
                data.receiverId ??
                data.receiver_id
            );


        if (
            receiverId !==
            getUserId()
        ) {

            return;

        }


        loadNotifications();

    }
);


// ==================================================
// BACK CHAT
// ==================================================
// ==================================================
// BACK TO FRIENDS FROM CHAT
// ==================================================

if (backChatBtn) {

    backChatBtn.addEventListener(
        "click",
        () => {

            document.body.classList.remove(
                "chat-mode"
            );

            if (chatSection) {

                chatSection.classList.remove(
                    "active"
                );

            }

            currentChatUser = null;

            showPage("friendsPage");

            const friendsButton =
                document.querySelector(
                    '[data-page="friendsPage"]'
                );

            if (friendsButton) {

                document
                    .querySelectorAll(".nav-btn")
                    .forEach(btn => {
                        btn.classList.remove("active");
                    });

                friendsButton.classList.add(
                    "active"
                );

            }

            loadFriends();

        }
    );

}
// ==================================================
// ADD FRIEND
// ==================================================

async function addFriend(friendId) {

    try {

        const response =
            await fetch(
                "/api/friend-request",
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            senderId:
                                getUserId(),

                            receiverId:
                                Number(friendId)

                        })

                }
            );


        const result =
            await response.json();


        alert(
            result.message ||
            "Request completed."
        );


    } catch (error) {

        console.error(
            "Friend request error:",
            error
        );


        alert(
            "Unable to connect to server."
        );

    }

}




async function loadFriends() {

    const friendList =
        document.getElementById("friendList");

    const desktopChatList =
        document.getElementById("desktopChatList");

    if (!friendList) {
        return;
    }

    try {

        const response =
            await fetch(
                `/api/friends/${getUserId()}`
            );

        const result =
            await response.json();

        friendList.innerHTML = "";

        if (desktopChatList) {
            desktopChatList.innerHTML = "";
        }

        if (
            !response.ok ||
            !result.success ||
            !Array.isArray(result.friends)
        ) {
            return;
        }

        if (result.friends.length === 0) {

            const empty =
                document.createElement("div");

            empty.className =
                "list-item";

            empty.textContent =
                "No friends yet.";

            friendList.appendChild(empty);

            return;
        }


        result.friends.forEach(friend => {


            // =========================================
            // DESKTOP CHAT ITEM
            // =========================================

            const desktopItem =
                document.createElement("div");

            desktopItem.className =
                "desktop-chat-item";


            // PROFILE IMAGE
            const desktopImage =
                document.createElement("img");

            desktopImage.src =
                friend.profile_image ||
                "/default-profile.png";

            desktopImage.className =
                "desktop-chat-image";

            desktopImage.alt =
                "Profile";


            // CHAT INFO
            const desktopInfo =
                document.createElement("div");

            desktopInfo.className =
                "desktop-chat-info";


            // NAME
            const desktopName =
                document.createElement("strong");

            desktopName.textContent =
                friend.name || "User";


            // LAST MESSAGE
            const desktopLastMessage =
                document.createElement("small");

            desktopLastMessage.className =
                "desktop-chat-last-message";

            desktopLastMessage.dataset.friendId =
                friend.id;

            desktopLastMessage.textContent =
                friend.last_message || "";


            desktopInfo.appendChild(
                desktopName
            );

            desktopInfo.appendChild(
                desktopLastMessage
            );


            desktopItem.appendChild(
                desktopImage
            );

            desktopItem.appendChild(
                desktopInfo
            );


            // OPEN CHAT
            desktopItem.addEventListener(
                "click",
                () => {

                    openChat(friend);

                }
            );


            if (desktopChatList) {

                desktopChatList.appendChild(
                    desktopItem
                );

            }



            // =========================================
            // MOBILE / EXISTING FRIEND ITEM
            // =========================================

            const item =
                document.createElement("div");

            item.className =
                "list-item friend-item";


            // PROFILE IMAGE
            const image =
                document.createElement("img");

            image.className =
                "friend-profile-image";

            image.src =
                friend.profile_image ||
                "/default-profile.png";

            image.alt =
                "Profile";


            // FRIEND INFO
            const info =
                document.createElement("div");

            info.className =
                "friend-info";


            // NAME
            const name =
                document.createElement("strong");

            name.textContent =
                friend.name || "User";


            // LAST MESSAGE
            const lastMessage =
                document.createElement("small");

            lastMessage.className =
                "friend-last-message";

            lastMessage.dataset.friendId =
                friend.id;

            lastMessage.textContent =
                friend.last_message || "";


            info.appendChild(
                name
            );

            info.appendChild(
                lastMessage
            );


            // 3 DOT BUTTON
            const menuBtn =
                document.createElement("button");

            menuBtn.className =
                "friend-menu-btn";

            menuBtn.type =
                "button";

            menuBtn.textContent =
                "⋮";


            menuBtn.addEventListener(
                "click",
                event => {

                    event.preventDefault();
                    event.stopPropagation();

                    openFriendMenu(
                        friend,
                        menuBtn
                    );

                }
            );


            // ADD ELEMENTS
            item.appendChild(
                image
            );

            item.appendChild(
                info
            );

            item.appendChild(
                menuBtn
            );


            // OPEN CHAT
            item.addEventListener(
                "click",
                () => {

                    openChat(friend);

                }
            );


            friendList.appendChild(
                item
            );

        });

    } catch (error) {

        console.error(
            "Friends error:",
            error
        );

    }

}


function closeFriendMenu() {

    const menu =
        document.getElementById(
            "friendActionMenu"
        );

    if (menu) {
        menu.remove();
    }

}



function openFriendMenu(
    friend,
    button
) {

    closeFriendMenu();


    const menu =
        document.createElement("div");

    menu.id =
        "friendActionMenu";

    menu.className =
        "friend-action-menu";


    // ==========================================
    // DELETE CHAT
    // ==========================================

    const deleteBtn =
        document.createElement("button");

    deleteBtn.type =
        "button";

    deleteBtn.textContent =
        "Delete Chat";

    deleteBtn.className =
        "friend-action-delete";
 

     deleteBtn.onclick = async function(event) {

    event.preventDefault();
    event.stopPropagation();

    const userId =
        Number(getUserId());

    const chatUserId =
        Number(friend.id);

    if (!userId || !chatUserId) {

        alert(
            "Invalid user information."
        );

        return;
    }

    const confirmed =
        confirm(
            "Delete this chat for everyone?"
        );

    if (!confirmed) {
        return;
    }

    try {

        const response =
            await fetch(
                "/api/delete-chat-for-everyone",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        userId:
                            userId,

                        chatUserId:
                            chatUserId
                    })
                }
            );

        const result =
            await response.json();

        if (
            !response.ok ||
            !result.success
        ) {

            alert(
                result.message ||
                "Failed to delete chat."
            );

            return;
        }

        closeFriendMenu();

        alert(
            "Chat deleted for everyone."
        );

        if (
            typeof loadChats ===
            "function"
        ) {
            await loadChats();
        }

    } catch (error) {

        console.error(
            "Delete chat for everyone error:",
            error
        );

        alert(
            "Unable to connect to server."
        );
    }

};
    // ==========================================
    // MORE INFO
    // ==========================================

    const infoBtn =
        document.createElement("button");

    infoBtn.type =
        "button";

    infoBtn.textContent =
        "More Info";

    infoBtn.className =
        "friend-action-info";


    infoBtn.addEventListener(
        "click",
        event => {

            event.preventDefault();
            event.stopPropagation();

            closeFriendMenu();

            moreInfo(friend);

        }
    );


    // ==========================================
    // UNFRIEND
    // ==========================================

    const unfriendBtn =
        document.createElement("button");

    unfriendBtn.type =
        "button";

    unfriendBtn.textContent =
        "Unfriend";

    unfriendBtn.className =
        "friend-action-unfriend";


    unfriendBtn.addEventListener(
        "click",
        event => {

            event.preventDefault();
            event.stopPropagation();

            closeFriendMenu();

            unfriendFriend(friend);

        }
    );



    // =========================================
// BLOCK
// =========================================

const blockBtn =
    document.createElement(
        "button"
    );

blockBtn.type =
    "button";

blockBtn.textContent =
    "Block";

blockBtn.className =
    "friend-action-block";


blockBtn.addEventListener(
    "click",
    event => {

        event.stopPropagation();

        closeFriendMenu();

        blockUser(
            friend
        );

    }
);


    // ==========================================
    // ADD BUTTONS
    // ==========================================

    menu.appendChild(deleteBtn);
    menu.appendChild(infoBtn);
    menu.appendChild(unfriendBtn);
    menu.appendChild(blockBtn);

    document.body.appendChild(menu);


    // ==========================================
    // POSITION MENU
    // ==========================================

    const rect =
        button.getBoundingClientRect();

    const menuWidth = 160;
    const menuHeight = 140;


    let left =
        rect.right -
        menuWidth;

    let top =
        rect.bottom + 5;


    if (left < 5) {
        left = 5;
    }


    if (
        left + menuWidth >
        window.innerWidth - 5
    ) {

        left =
            window.innerWidth -
            menuWidth -
            5;

    }


    if (
        top + menuHeight >
        window.innerHeight
    ) {

        top =
            rect.top -
            menuHeight -
            5;

    }


    if (top < 5) {
        top = 5;
    }


    menu.style.position =
        "fixed";

    menu.style.left =
        `${left}px`;

    menu.style.top =
        `${top}px`;

    menu.style.zIndex =
        "999999";


    // ==========================================
    // CLOSE WHEN CLICK OUTSIDE
    // ==========================================

    setTimeout(() => {

        document.addEventListener(
            "click",
            function closeOutside(event) {

                if (
                    !menu.contains(event.target) &&
                    event.target !== button
                ) {

                    closeFriendMenu();

                }

            },
            {
                once: true
            }
        );

    }, 0);

}

function blockUser(friend) {

    if (!friend) {
        return;
    }


    const confirmed =
        confirm(
            `Are you sure you want to block @${friend.username}?`
        );


    if (!confirmed) {

        return;

    }


    alert(
        `@${friend.username} will be blocked.`
    );

}


// ==================================================
// DELETE CHAT
// ==================================================
async function deleteChat(friendId) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this chat?"
        );

    if (!confirmed) {
        return;
    }

    try {

        const response =
            await fetch(
                "/api/delete-chat-for-me",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        userId:
                            Number(getUserId()),

                        chatUserId:
                            Number(friendId)

                    })
                }
            );

        const result =
            await response.json();

        alert(
            result.message ||
            "Chat deleted."
        );

        if (result.success) {

            if (
                currentChatUser &&
                Number(currentChatUser.id) ===
                Number(friendId)
            ) {

                currentChatUser = null;

                if (chatSection) {
                    chatSection.classList.remove(
                        "active"
                    );
                }

                showPage("chatsSection");
            }

            loadChats();
        }

    } catch (error) {

        console.error(
            "Delete chat error:",
            error
        );

        alert(
            "Unable to delete chat."
        );
    }
}



// ==================================================
// MORE INFO
// ==================================================


// ==================================================
// USER INFO POPUP
// ==================================================

const userInfoOverlay =
    document.getElementById(
        "userInfoOverlay"
    );



const userInfoImage =
    document.getElementById(
        "userInfoImage"
    );

const userInfoName =
    document.getElementById(
        "userInfoName"
    );

const userInfoUsername =
    document.getElementById(
        "userInfoUsername"
    );

const userInfoAbout =
    document.getElementById(
        "userInfoAbout"
    );


// ==================================================
// OPEN USER INFO
// ==================================================
async function moreInfo(friend) {

    if (!friend) {
        return;
    }


    try {

        const response =
            await fetch(
                `/api/user/${Number(friend.id)}`
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success ||
            !result.user
        ) {

            alert(
                "Unable to load user information."
            );

            return;

        }


        const user =
            result.user;


        // ==========================================
        // USER INFO POPUP ELEMENTS
        // ==========================================

        const userInfoOverlay =
            document.getElementById(
                "userInfoOverlay"
            );


        const userInfoImage =
            document.getElementById(
                "userInfoImage"
            );


        const userInfoName =
            document.getElementById(
                "userInfoName"
            );


        const userInfoUsername =
            document.getElementById(
                "userInfoUsername"
            );


        const userInfoBio =
            document.getElementById(
                "userInfoBio"
            );

















            const userInfoClose =
    document.getElementById(
        "userInfoClose"
    );




if (userInfoClose) {

    userInfoClose.addEventListener(
        "click",
        event => {

            event.preventDefault();
            event.stopPropagation();

            if (userInfoOverlay) {

                userInfoOverlay.classList.remove(
                    "active"
                );

            }

        }
    );

}

        // ==========================================
        // PROFILE IMAGE
        // ==========================================

        if (userInfoImage) {

            userInfoImage.src =
                user.profile_image ||
                "/default-profile.png";

        }


        // ==========================================
        // NAME
        // ==========================================

        if (userInfoName) {

            userInfoName.textContent =
                user.name ||
                "User";

        }


        // ==========================================
        // USERNAME
        // ==========================================

        if (userInfoUsername) {

            userInfoUsername.textContent =
                "@" +
                (user.username || "");

        }


        // ==========================================
        // BIO
        // ==========================================

        if (userInfoBio) {

            const bio =
                user.bio;

            if (
                bio &&
                String(bio).trim() !== ""
            ) {

                userInfoBio.textContent =
                    bio;

            } else {

                userInfoBio.textContent =
                    "No bio available.";

            }

        }


        // ==========================================
        // SHOW POPUP
        // ==========================================

        if (userInfoOverlay) {

            userInfoOverlay.classList.add(
                "active"
            );

        }


    } catch (error) {

        console.error(
            "More info error:",
            error
        );


        alert(
            "Unable to load user information."
        );

    }

}

// ==================================================
// CLOSE USER INFO
// ==================================================






const closeUserInfoBtn =
    document.getElementById("closeUserInfoBtn");

if (closeUserInfoBtn) {

    closeUserInfoBtn.addEventListener(
        "click",
        () => {

            const overlay =
                document.getElementById(
                    "userInfoOverlay"
                );

            if (overlay) {

                overlay.classList.remove(
                    "active"
                );

            }

        }
    );

}





function closeUserInfo() {

    if (userInfoOverlay) {

        userInfoOverlay.classList.remove(
            "active"
        );

    }

}


if (closeUserInfoBtn) {

    closeUserInfoBtn.addEventListener(
        "click",
        closeUserInfo
    );

}


// ==================================================
// CLOSE WHEN CLICKING OUTSIDE
// ==================================================

if (userInfoOverlay) {

    userInfoOverlay.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                userInfoOverlay
            ) {

                closeUserInfo();

            }

        }
    );

}

// ==================================================
// UNFRIEND
// ==================================================

async function unfriendFriend(friend) {

    if (!friend) {
        return;
    }


    const confirmed = confirm(
        `Are you sure you want to unfriend ${friend.name || "this user"}?`
    );


    if (!confirmed) {
        return;
    }


    try {

        const response = await fetch(
            "/api/unfriend",
            {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    userId: getUserId(),

                    friendId: Number(friend.id)

                })

            }
        );


        const result = await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            alert(
                result.message ||
                "Unable to unfriend."
            );

            return;

        }


        // ==========================================
        // IF THIS FRIEND'S CHAT IS CURRENTLY OPEN
        // ==========================================

        if (
            currentChatUser &&
            Number(currentChatUser.id) ===
            Number(friend.id)
        ) {

            currentChatUser = null;


            if (chatSection) {

                chatSection.classList.remove(
                    "active"
                );

            }

        }


        // ==========================================
        // REFRESH FRIEND LIST
        // ==========================================

        await loadFriends();


        // ==========================================
        // REFRESH FRIEND COUNT
        // ==========================================

        await loadFriendCount();


        // ==========================================
        // REFRESH CHAT LIST
        // ==========================================

        await loadChats();


        // ==========================================
        // GO TO FRIENDS
        // ==========================================

        showPage("friendsSection");


        alert(
            "Unfriend successful ✅\nChat deleted too."
        );


    } catch (error) {

        console.error(
            "Unfriend error:",
            error
        );


        alert(
            "Unable to connect to server."
        );

    }

}

// ==================================================
// LOAD CHATS
// ==================================================

async function loadChats() {

    const chatList =
        document.getElementById(
            "chatList"
        );


    if (!chatList) {

        return;

    }


    try {

        const response =
            await fetch(
                `/api/chats/${getUserId()}`
            );


        const result =
            await response.json();


        chatList.innerHTML =
            "";


        if (
            !response.ok ||
            !result.success ||
            !Array.isArray(result.chats) ||
            result.chats.length === 0
        ) {

            const empty =
                document.createElement(
                    "div"
                );


            empty.className =
                "list-item";


            empty.textContent =
                "No chats yet.";


            chatList.appendChild(
                empty
            );


            return;

        }


        result.chats.forEach(
            user => {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "list-item friend-item";


                const image =
                    document.createElement(
                        "img"
                    );


                image.className =
                    "friend-profile-image";


                image.src =
                    user.profile_image ||
                    "/default-profile.png";


                image.alt =
                    "Profile";


                const info =
                    document.createElement(
                        "div"
                    );


                info.className =
                    "friend-info";


                const name =
                    document.createElement(
                        "strong"
                    );


                name.textContent =
                    user.name;


                const username =
                    document.createElement(
                        "small"
                    );


                username.textContent =
                    "@" +
                    user.username;


                info.appendChild(name);

                info.appendChild(username);


                item.appendChild(image);

                item.appendChild(info);
            

                item.addEventListener("click", () => {
    openChat(user);
});


                chatList.appendChild(
                    item
                );

            }
        );


    } catch (error) {

        console.error(
            "Load chats error:",
            error
        );


        chatList.innerHTML =
            "";


        const errorItem =
            document.createElement(
                "div"
            );


        errorItem.className =
            "list-item";


        errorItem.textContent =
            "Unable to load chats.";


        chatList.appendChild(
            errorItem
        );

    }

}


// ==================================================
// NOTIFICATIONS
// ==================================================


async function loadNotifications() {

    if (!notificationList) {
        return;
    }

    try {

        // ==========================================
        // FETCH PINNED NOTIFICATIONS FIRST
        // ==========================================

        try {

            const pinnedResponse =
                await fetch(
                    `/api/pinned-notifications/${getUserId()}`
                );


            if (pinnedResponse.ok) {

                const pinnedResult =
                    await pinnedResponse.json();


                if (
                    pinnedResult.success &&
                    Array.isArray(pinnedResult.pinned)
                ) {

                    pinnedNotifications =
                        pinnedResult.pinned.map(
                            p =>
                                Number(
                                    p.notification_id
                                )
                        );

                }

            }

        } catch (error) {

            console.error(
                "Load pinned notifications error:",
                error
            );

        }


        // ==========================================
        // FETCH NOTIFICATIONS
        // ==========================================

        const response =
            await fetch(
                `/api/notifications/${getUserId()}`
            );

        const result =
            await response.json();

        console.log(
            "NOTIFICATIONS:",
            result.notifications
        );

        notificationList.innerHTML = "";


        // ==========================================
        // NO NOTIFICATIONS
        // ==========================================

        if (
            !response.ok ||
            !result.success ||
            !Array.isArray(result.notifications) ||
            result.notifications.length === 0
        ) {

            const item =
                document.createElement("div");

            item.className =
                "list-item";

            item.textContent =
                "No notifications";

            notificationList.appendChild(item);

            return;
        }


        // ==========================================
        // SORT — PINNED FIRST
        // ==========================================

        const sortedNotifications =
            [...result.notifications].sort((a, b) => {

                const aPinned =
                    pinnedNotifications.includes(
                        Number(a.id)
                    ) ? 1 : 0;

                const bPinned =
                    pinnedNotifications.includes(
                        Number(b.id)
                    ) ? 1 : 0;


                return bPinned - aPinned;

            });


        // ==========================================
        // RENDER EACH NOTIFICATION
        // ==========================================

        sortedNotifications.forEach(
            notification => {

                const isPinned =
                    pinnedNotifications.includes(
                        Number(notification.id)
                    );


                const item =
                    document.createElement("div");

                item.className =
                    "list-item friend-item notification-item";


                // ==========================================
                // PROFILE IMAGE
                // ==========================================

                const image =
                    document.createElement("img");

                image.className =
                    "friend-profile-image";

                image.src =
                    notification.profile_image ||
                    "/default-profile.png";

                image.alt =
                    "Profile";


                // ==========================================
                // INFORMATION
                // ==========================================

                const info =
                    document.createElement("div");

                info.className =
                    "friend-info";


                // ==========================================
                // NAME
                // ==========================================

                const name =
                    document.createElement("strong");

                name.textContent =
                    notification.name ||
                    "User";


                // ==========================================
                // MESSAGE
                // ==========================================

                const message =
                    document.createElement("small");

                message.textContent =
                    notification.message ||
                    "New notification";


                info.appendChild(name);
                info.appendChild(message);


                // ==========================================
                // FRIEND REQUEST BUTTONS
                // ==========================================

                if (
                    notification.message ===
                    "sent you a friend request"
                    &&
                    notification.request_id
                    &&
                    notification.request_status ===
                    "pending"
                ) {

                    const actions =
                        document.createElement("div");

                    actions.className =
                        "notification-actions";


                    // ACCEPT

                    const acceptButton =
                        document.createElement("button");

                    acceptButton.textContent =
                        "Accept";

                    acceptButton.className =
                        "accept-friend-button";


                    acceptButton.addEventListener(
                        "click",
                        async () => {

                            await acceptFriendRequest(
                                notification.request_id
                            );

                        }
                    );


                    // DECLINE

                    const declineButton =
                        document.createElement("button");

                    declineButton.textContent =
                        "Decline";

                    declineButton.className =
                        "decline-friend-button";


                    declineButton.addEventListener(
                        "click",
                        async () => {

                            await declineFriendRequest(
                                notification.request_id
                            );

                        }
                    );


                    actions.appendChild(
                        acceptButton
                    );

                    actions.appendChild(
                        declineButton
                    );


                    info.appendChild(actions);

                }


                // ==========================================
                // PIN BADGE
                // ==========================================

                let pinBadge = null;

                if (isPinned) {

                    pinBadge =
                        document.createElement("div");

                    pinBadge.className =
                        "notification-pinned-badge";

                    pinBadge.innerHTML = `
                        <span class="pin-icon">📌</span>
                        <span class="pin-label">pinned</span>
                    `;

                }


                // ==========================================
                // 3-DOT MENU BUTTON
                // ==========================================

                const menuBtn =
                    document.createElement("button");

                menuBtn.className =
                    "notification-menu-btn";

                menuBtn.type =
                    "button";

                menuBtn.textContent =
                    "⋮";


                menuBtn.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();
                        event.stopPropagation();

                        openNotificationMenu(
                            notification,
                            menuBtn,
                            isPinned
                        );

                    }
                );


                // ==========================================
                // ADD ELEMENTS
                // ==========================================

                item.appendChild(image);
                item.appendChild(info);


                if (pinBadge) {

                    item.appendChild(pinBadge);

                }


                item.appendChild(menuBtn);


                notificationList.appendChild(item);

            }
        );


    } catch (error) {

        console.error(
            "Notification error:",
            error
        );

    }

}




// ==================================================
// OPEN NOTIFICATION MENU
// ==================================================

function openNotificationMenu(
    notification,
    button,
    isPinned
) {

    closeNotificationMenu();


    const menu =
        document.createElement("div");


    menu.id =
        "notificationMenu";


    menu.className =
        "notification-menu";


    // ==========================================
    // DELETE NOTIFICATION BUTTON
    // ==========================================

    const deleteBtn =
        document.createElement("button");


    deleteBtn.type =
        "button";


    deleteBtn.className =
        "notification-menu-delete";


    deleteBtn.textContent =
        "Delete Notification";


    deleteBtn.addEventListener(
        "click",
        async event => {

            event.preventDefault();
            event.stopPropagation();

            closeNotificationMenu();

            await deleteNotificationItem(
                notification
            );

        }
    );


    // ==========================================
    // PIN / UNPIN BUTTON
    // ==========================================

    const pinBtn =
        document.createElement("button");


    pinBtn.type =
        "button";


    pinBtn.className =
        "notification-menu-pin";


    pinBtn.textContent =
        isPinned
            ? "Unpin"
            : "Pin";


    pinBtn.addEventListener(
        "click",
        async event => {

            event.preventDefault();
            event.stopPropagation();

            closeNotificationMenu();

            await togglePinNotification(
                notification,
                isPinned
            );

        }
    );


    // ==========================================
    // ADD BUTTONS
    // ==========================================

    menu.appendChild(deleteBtn);
    menu.appendChild(pinBtn);


    document.body.appendChild(menu);


    // ==========================================
    // POSITION
    // ==========================================

    const rect =
        button.getBoundingClientRect();


    const menuWidth = 180;

    const menuHeight = 110;


    let left =
        rect.right - menuWidth;


    let top =
        rect.bottom + 5;


    if (left < 5) {

        left = 5;

    }


    if (
        left + menuWidth >
        window.innerWidth - 5
    ) {

        left =
            window.innerWidth -
            menuWidth -
            5;

    }


    if (
        top + menuHeight >
        window.innerHeight - 5
    ) {

        top =
            rect.top -
            menuHeight -
            5;

    }


    if (top < 5) {

        top = 5;

    }


    menu.style.position =
        "fixed";


    menu.style.left =
        `${left}px`;


    menu.style.top =
        `${top}px`;


    menu.style.zIndex =
        "999999";


    // ==========================================
    // CLOSE ON OUTSIDE CLICK
    // ==========================================

    setTimeout(() => {

        document.addEventListener(
            "click",
            function closeOutside(event) {

                if (
                    !menu.contains(event.target) &&
                    event.target !== button
                ) {

                    closeNotificationMenu();

                }

            },
            {
                once: true
            }
        );

    }, 0);

}


// ==================================================
// CLOSE NOTIFICATION MENU
// ==================================================

function closeNotificationMenu() {

    const menu =
        document.getElementById(
            "notificationMenu"
        );


    if (menu) {

        menu.remove();

    }

}


// ==================================================
// DELETE NOTIFICATION
// ==================================================

async function deleteNotificationItem(notification) {

    const confirmed =
        confirm(
            "Delete this notification?"
        );


    if (!confirmed) {

        return;

    }


    // ==========================================
    // REMOVE FROM LOCAL PINNED LIST
    // ==========================================

    pinnedNotifications =
        pinnedNotifications.filter(
            id =>
                id !== Number(notification.id)
        );


    // ==========================================
    // SERVER REQUEST
    // ==========================================

    try {

        await fetch(
            "/api/delete-notification",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    userId:
                        getUserId(),

                    notificationId:
                        Number(notification.id)

                })

            }
        );

    } catch (error) {

        console.error(
            "Delete notification error:",
            error
        );

    }


    // ==========================================
    // REFRESH
    // ==========================================

    await loadNotifications();

}


// ==================================================
// TOGGLE PIN NOTIFICATION
// ==================================================

async function togglePinNotification(
    notification,
    isPinned
) {

    const action =
        isPinned
            ? "unpin"
            : "pin";


    try {

        const response =
            await fetch(
                "/api/pin-notification",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        userId:
                            getUserId(),

                        notificationId:
                            Number(notification.id),

                        action:
                            action

                    })

                }
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            alert(
                result.message ||
                "Failed to update pin."
            );

            return;

        }


        // ==========================================
        // UPDATE LOCAL PINNED LIST
        // ==========================================

        if (action === "pin") {

            if (
                !pinnedNotifications.includes(
                    Number(notification.id)
                )
            ) {

                pinnedNotifications.push(
                    Number(notification.id)
                );

            }

        } else {

            pinnedNotifications =
                pinnedNotifications.filter(
                    id =>
                        id !== Number(notification.id)
                );

        }


        // ==========================================
        // REFRESH
        // ==========================================

        await loadNotifications();

    } catch (error) {

        console.error(
            "Toggle pin notification error:",
            error
        );

        alert(
            "Unable to connect to server."
        );

    }

}





// ==================================================
// FRIEND COUNT
// ==================================================

async function loadFriendCount() {

    try {

        const response =
            await fetch(
                `/api/friends/count/${getUserId()}`
            );


        if (!response.ok) {

            return;

        }


        const result =
            await response.json();


        if (!result.success) {

            return;

        }


        const friendCount =
            document.getElementById(
                "friendCount"
            );

        const friendCountProfile =
            document.getElementById(
                "friendCountProfile"
            );


        const text =
            `Friends: ${result.total}`;


        if (friendCount) {

            friendCount.textContent =
                text;

        }


        if (friendCountProfile) {

            friendCountProfile.textContent =
                text;

        }


    } catch (error) {

        console.error(
            "Friend count error:",
            error
        );

    }

}


// ==================================================
// PROFILE IMAGE
// ==================================================

const uploadPictureBtn =
    document.getElementById(
        "uploadPictureBtn"
    );

const imageInput =
    document.getElementById(
        "imageInput"
    );


if (
    uploadPictureBtn &&
    imageInput
) {

    uploadPictureBtn.addEventListener(
        "click",
        () => {

            imageInput.click();

        }
    );


    imageInput.addEventListener(
        "change",
        async event => {

            const file =
                event.target.files[0];


            if (!file) {

                return;

            }


            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                alert(
                    "Please select an image."
                );

                return;

            }


            const formData =
                new FormData();


            formData.append(
                "image",
                file
            );


            formData.append(
                "userId",
                getUserId()
            );


            try {

                const response =
                    await fetch(
                        "/api/profile-image",
                        {

                            method:
                                "POST",

                            body:
                                formData

                        }
                    );


                const result =
                    await response.json();


                if (
                    !response.ok ||
                    !result.success
                ) {

                    alert(
                        result.message ||
                        "Upload failed."
                    );

                    return;

                }


                const image =
                    result.image;


                const profileImage =
                    document.getElementById(
                        "profileImage"
                    );


                const profileBtnImage =
                    document.getElementById(
                        "profileBtnImage"
                    );


                if (profileImage) {

                    profileImage.src =
                        image;

                }


                if (profileBtnImage) {

                    profileBtnImage.src =
                        image;

                }


                currentUser.profile_image =
                    image;


                localStorage.setItem(
                    "user",
                    JSON.stringify(
                        currentUser
                    )
                );


                loadFriends();


                alert(
                    "Profile picture updated ✅"
                );


            } catch (error) {

                console.error(
                    "Image upload error:",
                    error
                );


                alert(
                    "Image upload failed."
                );

            }


            imageInput.value =
                "";

        }
    );

}


// ==================================================
// LOGOUT
// ==================================================

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        () => {

            const confirmed =
                confirm(
                    "Are you sure you want to log out?"
                );


            if (!confirmed) {

                return;

            }


            socket.disconnect();


            localStorage.removeItem(
                "user"
            );


            localStorage.removeItem(
                "searchHistory"
            );


            window.location.href =
                "login.html";

        }
    );

}


// ==================================================
// DELETE ACCOUNT
// ==================================================

const deleteAccountBtn =
    document.getElementById(
        "deleteAccountBtn"
    );


if (deleteAccountBtn) {

    deleteAccountBtn.addEventListener(
        "click",
        async () => {

            const confirmed =
                confirm(
                    "Are you sure you want to delete your account?"
                );


            if (!confirmed) {

                return;

            }


            const finalConfirm =
                confirm(
                    "This will permanently delete your account. Continue?"
                );


            if (!finalConfirm) {

                return;

            }


            try {

                const response =
                    await fetch(
                        "/api/delete-account",
                        {

                            method:
                                "DELETE",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    userId:
                                        getUserId()

                                })

                        }
                    );


                const result =
                    await response.json();


                if (
                    !response.ok ||
                    !result.success
                ) {

                    alert(
                        result.message ||
                        "Account deletion failed."
                    );

                    return;

                }


                socket.disconnect();


                localStorage.removeItem(
                    "user"
                );


                localStorage.removeItem(
                    "searchHistory"
                );


                localStorage.removeItem(
                    "darkMode"
                );


                alert(
                    "Account deleted successfully ✅"
                );


                window.location.href =
                    "login.html";


            } catch (error) {

                console.error(
                    " account error:",
                    error
                );


                alert(
                    "Unable to contact server."
                );

            }

        }
    );

}


// ==================================================
// ATTACHMENT
// ==================================================




// ==================================================
// VOICE
// ==================================================

const voiceBtn =
    document.getElementById(
        "voiceBtn"
    );


if (voiceBtn) {

    voiceBtn.addEventListener(
        "click",
        () => {

            alert(
                "Voice message feature will be added later."
            );

        }
    );

}


// ==================================================
// ONLINE USERS
// ==================================================

socket.on(
    "online-users",
    users => {

        onlineUsers =
            Array.isArray(users)
                ? users.map(
                    id => Number(id)
                )
                : [];


        if (currentChatUser) {

            updateOnlineStatus(
                currentChatUser.id
            );

        }

    }
);


socket.on(
    "typing",
    data => {

        if (!data) {
            return;
        }

        const typingUserId =
            Number(data.senderId);

        if (!typingUserId) {
            return;
        }


        // ==========================================
        // SHOW TYPING IN FRIEND LIST
        // ==========================================

        const friendLastMessage =
            document.querySelector(
                `.friend-last-message[data-friend-id="${typingUserId}"]`
            );

        if (friendLastMessage) {

            friendLastMessage.textContent =
                "Typing...";

        }


        // ==========================================
        // SHOW TYPING INSIDE OPEN CHAT
        // ==========================================

        if (
            currentChatUser &&
            typingIndicator
        ) {

            if (
                typingUserId ===
                Number(currentChatUser.id)
            ) {

                typingIndicator.textContent =
                    "Typing...";

            }

        }

    }
);



socket.on(
    "stop-typing",
    data => {

        if (!data) {
            return;
        }

        const typingUserId =
            Number(data.senderId);

        if (!typingUserId) {
            return;
        }

        const friendLastMessage =
            document.querySelector(
                `.friend-last-message[data-friend-id="${typingUserId}"]`
            );

        if (friendLastMessage) {

            // Latest message আবার load হবে
            loadFriends();

        }

        // Open chat-এর typing indicator বন্ধ
        if (
            currentChatUser &&
            typingIndicator
        ) {

            if (
                typingUserId ===
                Number(currentChatUser.id)
            ) {

                typingIndicator.textContent =
                    "";
            }

        }

    }
);





// STOP TYPING RECEIVE
// ==================================================

socket.on(
    "stop-typing",
    data => {

        if (
            !currentChatUser ||
            !typingIndicator
        ) {

            return;

        }


        if (
            Number(data.senderId) ===
            Number(currentChatUser.id)
        ) {

            typingIndicator.textContent =
                "";

        }

    }
);


// ==================================================
// ONLINE STATUS
// ==================================================

async function updateOnlineStatus(
    userId
) {

    if (!chatUserStatus) {

        return;

    }


    if (
        onlineUsers.includes(
            Number(userId)
        )
    ) {

        chatUserStatus.textContent =
            " Online";

        return;

    }


    try {

        const response =
            await fetch(
                `/api/user/${Number(userId)}`
            );


        const result =
            await response.json();


        if (
            result.success &&
            result.user
        ) {

            chatUserStatus.textContent =
                " Offline " +
                formatLastSeen(
                    result.user.last_seen
                );

        } else {

            chatUserStatus.textContent =
                " Offline";

        }


    } catch (error) {

        console.error(
            "Online status error:",
            error
        );


        chatUserStatus.textContent =
            " Offline";

    }





}







// ==================================================
// SAVE FIRST BIO
// ==================================================

async function saveBio() {

    if (!bioInput) {
        return;
    }


    const bio =
        bioInput.value.trim();


    if (!bio) {

        alert(
            "Please write something."
        );

        return;

    }


    if (bio.length > 150) {

        alert(
            "Bio cannot be more than 150 characters."
        );

        return;

    }


    try {

        const response =
            await fetch(
                "/api/change-bio",
                {

                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            userId:
                                getUserId(),

                            bio:
                                bio

                        })

                }
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            alert(
                result.message ||
                "Unable to save bio."
            );

            return;

        }


        // ==================================================
        // SAVE BIO TO CURRENT USER
        // ==================================================

        currentUser.bio =
            result.bio;


        localStorage.setItem(
            "user",
            JSON.stringify(
                currentUser
            )
        );


        // ==================================================
        // SHOW SAVED BIO
        // ==================================================

        if (bioText) {

            bioText.textContent =
                result.bio;

        }


        // ==================================================
        // HIDE INPUT + SAVE
        // ==================================================

        if (bioEditor) {

            bioEditor.style.display =
                "none";

        } else {

            // fallback

            if (bioInput) {

                bioInput.style.display =
                    "none";

            }

            if (saveBioBtn) {

                saveBioBtn.style.display =
                    "none";

            }

        }


        // ==================================================
        // SHOW BIO + ❌
        // ==================================================

        if (savedBio) {

            savedBio.style.display =
                "flex";

        }


        // Clear input

        bioInput.value =
            "";


    } catch (error) {

        console.error(
            "Save bio error:",
            error
        );


        alert(
            "Unable to contact server."
        );

    }

}


// ==================================================
// SAVE BIO BUTTON
// ==================================================

if (saveBioBtn) {

    saveBioBtn.addEventListener(
        "click",
        saveBio
    );

}






// ==================================================
// FORMAT LAST SEEN
// ==================================================

function formatLastSeen(
    timestamp
) {

    if (!timestamp) {

        return "Offline";

    }


    let date;


    if (
        typeof timestamp ===
        "number" ||
        !isNaN(
            Number(timestamp)
        )
    ) {

        date =
            new Date(
                Number(timestamp)
            );

    } else {

        date =
            new Date(
                timestamp
            );

    }


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return "Offline";

    }


    return (
        "Last seen: " +
        date.toLocaleString()
    );

}






// ==================================================
// CLOSE FRIEND MENU ON SCROLL
// ==================================================

document.addEventListener(
    "scroll",
    () => {

        closeFriendMenu();

    },
    true
);








// ==================================================
// CHANGE BIO
// ==================================================

if (changeBioBtn) {

    changeBioBtn.addEventListener(
        "click",
        () => {

            if (!changeBioOverlay) {
                return;
            }

            // প্রথমে confirmation দেখাবে

            if (bioConfirmStep) {

                bioConfirmStep.style.display =
                    "block";

            }

            if (newBioStep) {

                newBioStep.style.display =
                    "none";

            }

            if (newBioInput) {

                newBioInput.value = "";

            }

            changeBioOverlay.classList.add(
                "active"
            );

        }
    );

}

// ==================================================
// CLOSE BIO POPUP — × BUTTON
// ==================================================

const closeBioPopupBtn =
    document.getElementById(
        "closeBioPopupBtn"
    );


if (closeBioPopupBtn) {

    closeBioPopupBtn.addEventListener(
        "click",
        () => {

            if (changeBioOverlay) {

                changeBioOverlay.classList.remove(
                    "active"
                );

            }

            // Reset popup state

            if (bioConfirmStep) {

                bioConfirmStep.style.display =
                    "block";

            }

            if (newBioStep) {

                newBioStep.style.display =
                    "none";

            }

            if (newBioInput) {

                newBioInput.value = "";

            }

        }
    );

}


// ==================================================
// CLOSE BIO POPUP — CLICK OUTSIDE
// ==================================================

if (changeBioOverlay) {

    changeBioOverlay.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                changeBioOverlay
            ) {

                changeBioOverlay.classList.remove(
                    "active"
                );

                // Reset popup state

                if (bioConfirmStep) {

                    bioConfirmStep.style.display =
                        "block";

                }

                if (newBioStep) {

                    newBioStep.style.display =
                        "none";

                }

                if (newBioInput) {

                    newBioInput.value = "";

                }

            }

        }
    );

}


// ==================================================
// CLOSE BIO POPUP — ESC KEY
// ==================================================

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape" &&
            changeBioOverlay &&
            changeBioOverlay.classList.contains(
                "active"
            )
        ) {

            changeBioOverlay.classList.remove(
                "active"
            );

            // Reset popup state

            if (bioConfirmStep) {

                bioConfirmStep.style.display =
                    "block";

            }

            if (newBioStep) {

                newBioStep.style.display =
                    "none";

            }

            if (newBioInput) {

                newBioInput.value = "";

            }

        }

    }
);




// ==================================================
// BIO OK BUTTON
// ==================================================

if (bioOkBtn) {

    bioOkBtn.addEventListener(
        "click",
        () => {

            if (bioConfirmStep) {

                bioConfirmStep.style.display =
                    "none";

            }

            if (newBioStep) {

                newBioStep.style.display =
                    "block";

            }

            if (newBioInput) {

                newBioInput.focus();

            }

        }
    );

}


// ==================================================
// SAVE NEW BIO
// ==================================================

if (saveNewBioBtn) {

    saveNewBioBtn.addEventListener(
        "click",
        async () => {

            if (!newBioInput) {
                return;
            }

            const newBio =
                newBioInput.value.trim();


            if (!newBio) {

                alert(
                    "Please write your new bio."
                );

                return;

            }


            if (newBio.length > 150) {

                alert(
                    "Bio cannot be more than 150 characters."
                );

                return;

            }


            try {

                const response =
                    await fetch(
                        "/api/change-bio",
                        {

                            method:
                                "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    userId:
                                        getUserId(),

                                    bio:
                                        newBio

                                })

                        }
                    );


                const result =
                    await response.json();


                if (
                    !response.ok ||
                    !result.success
                ) {

                    alert(
                        result.message ||
                        "Unable to change bio."
                    );

                    return;

                }


                // Update local user

                currentUser.bio =
                    result.bio;


                localStorage.setItem(
                    "user",
                    JSON.stringify(
                        currentUser
                    )
                );


                // Show new bio

                if (bioText) {

                    bioText.textContent =
                        result.bio;

                }


                if (bioEditor) {

                    bioEditor.style.display =
                        "none";

                }


                if (savedBio) {

                    savedBio.style.display =
                        "flex";

                }


                // Close popup

                changeBioOverlay.classList.remove(
                    "active"
                );


                newBioInput.value =
                    "";


            } catch (error) {

                console.error(
                    "Change bio error:",
                    error
                );


                alert(
                    "Unable to contact server."
                );

            }

        }
    );

}



// ==================================================
// IGNORE BIO
// ==================================================

if (ignoreBioBtn) {

ignoreBioBtn.addEventListener(  
    "click",  
    async () => {  

        try {  

            const response =  
                await fetch(  
                    "/api/change-bio",  
                    {  

                        method:  
                            "POST",  

                        headers: {  
                            "Content-Type":  
                                "application/json"  
                        },  

                        body:  
                            JSON.stringify({  

                                userId:  
                                    getUserId(),  

                                bio:  
                                    ""  

                            })  

                    }  
                );  


            const result =  
                await response.json();  


            if (  
                !response.ok ||  
                !result.success  
            ) {  

                alert(  
                    result.message ||  
                    "Unable to remove bio."  
                );  

                return;  

            }  


            // Remove bio from local user  

            currentUser.bio =  
                "";  


            localStorage.setItem(  
                "user",  
                JSON.stringify(  
                    currentUser  
                )  
            );  


            // Hide saved bio  

            if (savedBio) {  

                savedBio.style.display =  
                    "none";  

            }  


            // Show input again  

            if (bioEditor) {  

                bioEditor.style.display =  
                    "block";  

            }  


            if (bioInput) {  

                bioInput.value =  
                    "";  

            }  


            // Close popup  

            changeBioOverlay.classList.remove(  
                "active"  
            );  


            // Reset popup  

            if (bioConfirmStep) {  

                bioConfirmStep.style.display =  
                    "block";  

            }  

            if (newBioStep) {  

                newBioStep.style.display =  
                    "none";  

            }  


        } catch (error) {  

            console.error(  
                "Remove bio error:",  
                error  
            );  


            alert(  
                "Unable to contact server."  
            );  

        }  

    }  
);

}



// ==================================================
// ACCEPT FRIEND REQUEST
// ==================================================

async function acceptFriendRequest(requestId) {

    if (!requestId) {

        console.error(
            "Missing friend request ID"
        );

        return;

    }


    try {

        const response =
            await fetch(
                "/api/friend-request/accept",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        userId:
                            getUserId(),

                        requestId:
                            requestId

                    })

                }
            );


        const result =
            await response.json();


        if (!response.ok || !result.success) {

            alert(
                result.message ||
                "Failed to accept friend request."
            );

            return;

        }


        // ==================================================
        // RELOAD NOTIFICATIONS
        // ==================================================

        await loadNotifications();


        // ==================================================
        // RELOAD FRIEND LIST
        // ==================================================

        if (
            typeof loadFriends ===
            "function"
        ) {

            loadFriends();

        }


        console.log(
            "Friend request accepted."
        );


    } catch (error) {

        console.error(
            "Accept friend request error:",
            error
        );

        alert(
            "Something went wrong."
        );

    }

}


// ==================================================
// DECLINE FRIEND REQUEST
// ==================================================

async function declineFriendRequest(requestId) {

    if (!requestId) {

        console.error(
            "Missing friend request ID"
        );

        return;

    }


    try {

        const response =
            await fetch(
                "/api/friend-request/decline",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        userId:
                            getUserId(),

                        requestId:
                            requestId

                    })

                }
            );


        const result =
            await response.json();


        if (!response.ok || !result.success) {

            alert(
                result.message ||
                "Failed to decline friend request."
            );

            return;

        }


        // ==================================================
        // REMOVE NOTIFICATION FROM SCREEN
        // ==================================================

        await loadNotifications();


        console.log(
            "Friend request declined."
        );


    } catch (error) {

        console.error(
            "Decline friend request error:",
            error
        );

        alert(
            "Something went wrong."
        );

    }

}








if (attachmentBtn) {

    attachmentBtn.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            if (!attachmentMenu) {
                return;
            }

            const isOpen =
                attachmentMenu.style.display ===
                "flex";

            attachmentMenu.style.display =
                isOpen
                    ? "none"
                    : "flex";

        }
    );

}




// ==================================================
// CLOSE MENU WHEN CLICKING OUTSIDE
// ==================================================

document.addEventListener(
    "click",
    event => {

        if (
            attachmentMenu &&
            !attachmentMenu.contains(
                event.target
            ) &&
            event.target !== attachmentBtn
        ) {

            attachmentMenu.style.display =
                "none";

        }

    }
);


// ==================================================
// SEND VIDEO BUTTON
// ==================================================

if (sendVideoBtn) {

    sendVideoBtn.addEventListener(
        "click",
        () => {

            if (!currentChatUser) {

                alert(
                    "Please open a chat first."
                );

                return;

            }

            if (videoInput) {

                videoInput.click();

            }

            if (attachmentMenu) {

                attachmentMenu.style.display =
                    "none";

            }

        }
    );

}


// ==================================================
// SEND PHOTO BUTTON
// ==================================================

if (sendPhotoBtn) {

    sendPhotoBtn.addEventListener(
        "click",
        () => {

            if (!currentChatUser) {

                alert(
                    "Please open a chat first."
                );

                return;

            }

            if (photoInput) {

                photoInput.click();

            }

            if (attachmentMenu) {

                attachmentMenu.style.display =
                    "none";

            }

        }
    );

}


// ==================================================
// VIDEO SELECTED
// ==================================================

if (videoInput) {

    videoInput.addEventListener(
        "change",
        async event => {

            const file =
                event.target.files[0];

            if (!file) {
                return;
            }


            // ==================================================
            // CHECK CHAT
            // ==================================================

            if (!currentChatUser) {

                alert(
                    "Please open a chat first."
                );

                videoInput.value = "";

                return;

            }


            // ==================================================
            // CHECK VIDEO TYPE
            // ==================================================

            if (
                !file.type.startsWith(
                    "video/"
                )
            ) {

                alert(
                    "Please select a valid video file."
                );

                videoInput.value = "";

                return;

            }


            console.log(
                "Video selected:",
                file.name
            );


            // ==================================================
            // CREATE FORM DATA
            // ==================================================

            const formData =
                new FormData();


            formData.append(
                "media",
                file
            );


            formData.append(
                "senderId",
                currentUser.id
            );


            formData.append(
                "receiverId",
                currentChatUser.id
            );


            // ==================================================
            // UPLOAD VIDEO
            // ==================================================

            try {

                const response =
                    await fetch(
                        "/api/media-message",
                        {
                            method: "POST",
                            body: formData
                        }
                    );


                const data =
                    await response.json();


                // ==================================================
                // CHECK RESPONSE
                // ==================================================

                if (!data.success) {

                    console.error(
                        "Video upload failed:",
                        data.message
                    );

                    alert(
                        data.message ||
                        "Video upload failed."
                    );

                    return;

                }


                // ==================================================
                // SUCCESS
                // ==================================================

                console.log(
                    "Video uploaded successfully:",
                    data.media
                );


            } catch (error) {

                console.error(
                    "Video upload error:",
                    error
                );

                alert(
                    "Video upload failed. Please try again."
                );


            } finally {

                videoInput.value = "";

            }

        }
    );

}


// ==================================================
// PHOTO SELECTED
// ==================================================

if (photoInput) {

    photoInput.addEventListener(
        "change",
        async event => {

            const file =
                event.target.files[0];

            if (!file) {
                return;
            }


            // ==================================================
            // CHECK CHAT
            // ==================================================

            if (!currentChatUser) {

                alert(
                    "Please open a chat first."
                );

                photoInput.value = "";

                return;

            }


            // ==================================================
            // CHECK IMAGE TYPE
            // ==================================================

            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                alert(
                    "Please select a valid photo."
                );

                photoInput.value = "";

                return;

            }


            console.log(
                "Photo selected:",
                file.name
            );


            // ==================================================
            // CREATE FORM DATA
            // ==================================================

            const formData =
                new FormData();


            formData.append(
                "media",
                file
            );


            formData.append(
                "senderId",
                currentUser.id
            );


            formData.append(
                "receiverId",
                currentChatUser.id
            );


            // ==================================================
            // UPLOAD PHOTO
            // ==================================================

            try {

                const response =
                    await fetch(
                        "/api/media-message",
                        {
                            method: "POST",
                            body: formData
                        }
                    );


                const data =
                    await response.json();


                // ==================================================
                // CHECK RESPONSE
                // ==================================================

                if (!data.success) {

                    console.error(
                        "Photo upload failed:",
                        data.message
                    );

                    alert(
                        data.message ||
                        "Photo upload failed."
                    );

                    return;

                }


                // ==================================================
                // SUCCESS
                // ==================================================

                console.log(
                    "Photo uploaded successfully:",
                    data.media
                );


            } catch (error) {

                console.error(
                    "Photo upload error:",
                    error
                );

                alert(
                    "Photo upload failed. Please try again."
                );


            } finally {

                photoInput.value = "";

            }

        }
    );

}


// ==================================================
// MESSAGE CONTEXT MENU
// ==================================================

const messageContextMenu =
    document.getElementById(
        "messageContextMenu"
    );

const copyMessageBtn =
    document.getElementById(
        "copyMessageBtn"
    );

const deleteMessageBtn =
    document.getElementById(
        "deleteMessageBtn"
    );

const shareMessageBtn =
    document.getElementById(
        "shareMessageBtn"
    );

const reportMessageBtn =
    document.getElementById(
        "reportMessageBtn"
    );


// বর্তমানে যেই message select করা হয়েছে

let selectedMessage = null;


// ==================================================
// SHOW MENU
// ==================================================

function showMessageContextMenu(
    messageElement,
    x,
    y
) {

    if (!messageContextMenu) {
        return;
    }


    selectedMessage =
        messageElement;


    messageContextMenu.style.display =
        "block";


    // প্রথমে position সেট করি

    messageContextMenu.style.left =
        x + "px";

    messageContextMenu.style.top =
        y + "px";


    // Screen-এর বাইরে চলে গেলে ঠিক করা

    const menuRect =
        messageContextMenu.getBoundingClientRect();


    if (
        menuRect.right >
        window.innerWidth
    ) {

        messageContextMenu.style.left =
            (
                window.innerWidth -
                menuRect.width -
                10
            ) + "px";

    }


    if (
        menuRect.bottom >
        window.innerHeight
    ) {

        messageContextMenu.style.top =
            (
                window.innerHeight -
                menuRect.height -
                10
            ) + "px";

    }

}


// ==================================================
// HIDE MENU
// ==================================================

function hideMessageContextMenu() {

    if (!messageContextMenu) {
        return;
    }


    messageContextMenu.style.display =
        "none";


    selectedMessage = null;

}


// ==================================================
// RIGHT CLICK — PC
// ==================================================

if (messages) {

    messages.addEventListener(
        "contextmenu",
        event => {

            const messageElement =
                event.target.closest(
                    ".message"
                );


            // Message-এর বাইরে right click করলে
            // menu দেখাবে না

            if (!messageElement) {

                return;

            }


            event.preventDefault();


            showMessageContextMenu(
                messageElement,
                event.clientX,
                event.clientY
            );

        }
    );

}


// ==================================================
// CLICK OUTSIDE MENU
// ==================================================

document.addEventListener(
    "click",
    event => {

        if (
            messageContextMenu &&
            !messageContextMenu.contains(
                event.target
            )
        ) {

            hideMessageContextMenu();

        }

    }
);



// ==================================================
// COPY MESSAGE TEXT
// ==================================================
if (copyMessageBtn) {

    copyMessageBtn.addEventListener(
        "click",
        async () => {

            if (!selectedMessage) {
                return;
            }

            const text =
                selectedMessage.textContent.trim();

            if (!text) {

                hideMessageContextMenu();

                return;

            }

            try {

                // ==================================================
                // MODERN CLIPBOARD API
                // ==================================================

                if (
                    navigator.clipboard &&
                    typeof navigator.clipboard.writeText ===
                    "function"
                ) {

                    await navigator.clipboard.writeText(
                        text
                    );

                }

                // ==================================================
                // FALLBACK FOR HTTP / LAN IP
                // ==================================================

                else {

                    const textarea =
                        document.createElement(
                            "textarea"
                        );

                    textarea.value =
                        text;

                    textarea.style.position =
                        "fixed";

                    textarea.style.left =
                        "-9999px";

                    textarea.style.top =
                        "0";

                    document.body.appendChild(
                        textarea
                    );

                    textarea.focus();

                    textarea.select();

                    const successful =
                        document.execCommand(
                            "copy"
                        );

                    textarea.remove();

                    if (!successful) {

                        throw new Error(
                            "Copy command failed"
                        );

                    }

                }


                console.log(
                    "Message copied successfully."
                );


            } catch (error) {

                console.error(
                    "Copy message error:",
                    error
                );

            }


            hideMessageContextMenu();

        }
    );

}





async function deleteSelectedMessage() {

    if (!selectedMessage) {
        console.log("No message selected.");
        return;
    }

    const userId = getUserId();

    if (!userId) {
        alert("User not found.");
        return;
    }

    const messageId =
        Number(selectedMessage.dataset.messageId);

    const mediaId =
        Number(selectedMessage.dataset.mediaId);


    // ==============================
    // DELETE MEDIA
    // ==============================

    if (mediaId) {

        try {

            const response = await fetch(
                "/api/delete-media-message",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        userId: userId,
                        mediaId: mediaId
                    })
                }
            );

            const result =
                await response.json();

            if (
                !response.ok ||
                !result.success
            ) {

                alert(
                    result.message ||
                    "Failed to delete media."
                );

                return;
            }

            selectedMessage.remove();

            selectedMessage = null;

            hideMessageContextMenu();

            console.log(
                "Media deleted for me."
            );

        } catch (error) {

            console.error(
                "Delete media error:",
                error
            );

            alert(
                "Failed to delete media."
            );
        }

        return;
    }


    // ==============================
    // DELETE TEXT MESSAGE
    // ==============================

    if (messageId) {

        try {

            const response = await fetch(
                "/api/delete-message",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        userId: userId,
                        messageId: messageId
                    })
                }
            );

            const result =
                await response.json();

            if (
                !response.ok ||
                !result.success
            ) {

                alert(
                    result.message ||
                    "Failed to delete message."
                );

                return;
            }

            selectedMessage.remove();

            selectedMessage = null;

            hideMessageContextMenu();

            console.log(
                "Message deleted for me."
            );

        } catch (error) {

            console.error(
                "Delete message error:",
                error
            );

            alert(
                "Failed to delete message."
            );
        }

        return;
    }


    alert(
        "Message ID not found."
    );
}




const deleteMessageForMeBtn =
    document.getElementById(
        "deleteMessageForMeBtn"
    );

if (deleteMessageForMeBtn) {

    deleteMessageForMeBtn.addEventListener(
        "click",
        async () => {

            await deleteSelectedMessage();

        }
    );

}






const userInfoClose =
    document.getElementById(
        "userInfoClose"
    );



if (userInfoClose) {

    userInfoClose.addEventListener(
        "click",
        () => {

            userInfoOverlay.classList.remove(
                "active"
            );

        }
    );

}


if (userInfoOverlay) {

    userInfoOverlay.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                userInfoOverlay
            ) {

                userInfoOverlay.classList.remove(
                    "active"
                );

            }

        }
    );

}


async function showUserProfilePopup(user) {

    if (!user) {
        return;
    }

    const overlay =
        document.getElementById(
            "userInfoOverlay"
        );

    const image =
        document.getElementById(
            "userInfoImage"
        );

    const name =
        document.getElementById(
            "userInfoName"
        );

    const username =
        document.getElementById(
            "userInfoUsername"
        );

    const bio =
        document.getElementById(
            "userInfoBio"
        );


    // ==========================================
    // IMMEDIATELY SHOW WHAT WE HAVE
    // ==========================================

    if (image) {

        image.src =
            user.profile_image ||
            "/default-profile.png";

    }


    if (name) {

        name.textContent =
            user.name ||
            "User";

    }


    if (username) {

        username.textContent =
            "@" +
            (user.username || "");

    }


    if (bio) {

        const bioText =
            (user.bio && String(user.bio).trim())
                ? String(user.bio).trim()
                : "No bio yet";

        bio.textContent =
            bioText;

    }


    if (overlay) {

        overlay.classList.add(
            "active"
        );

    }


    // ==========================================
    // FETCH FRESH DATA FROM SERVER
    // ==========================================

    try {

        const response =
            await fetch(
                `/api/user/${Number(user.id)}`
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success ||
            !result.user
        ) {

            return;

        }


        const freshUser =
            result.user;


        // ==========================================
        // UPDATE IMAGE
        // ==========================================

        if (image) {

            image.src =
                freshUser.profile_image ||
                "/default-profile.png";

        }


        // ==========================================
        // UPDATE NAME
        // ==========================================

        if (name) {

            name.textContent =
                freshUser.name ||
                "User";

        }


        // ==========================================
        // UPDATE USERNAME
        // ==========================================

        if (username) {

            username.textContent =
                "@" +
                (freshUser.username || "");

        }


        // ==========================================
        // UPDATE BIO
        // ==========================================

        if (bio) {

            const bioText =
                (freshUser.bio && String(freshUser.bio).trim())
                    ? String(freshUser.bio).trim()
                    : "No bio yet";

            bio.textContent =
                bioText;

        }


        // ==========================================
        // UPDATE CURRENT CHAT USER CACHE
        // ==========================================

        if (
            currentChatUser &&
            Number(currentChatUser.id) ===
            Number(freshUser.id)
        ) {

            currentChatUser.bio =
                freshUser.bio || "";

        }


    } catch (error) {

        console.error(
            "Show profile popup error:",
            error
        );

    }

}

async function openChatUserProfile(user) {

    if (!user) {
        return;
    }


    // =========================================
    // SAVE CURRENT USER
    // =========================================

    currentChatUser = {

        id:
            Number(user.id),

        name:
            user.name || "",

        username:
            user.username || "",

        profile_image:
            user.profile_image || null,

        bio:
            user.bio || ""

    };


    // =========================================
    // GET ELEMENTS
    // =========================================

    const image =
        document.getElementById(
            "chatProfilePageImage"
        );

    const name =
        document.getElementById(
            "chatProfilePageName"
        );

    const username =
        document.getElementById(
            "chatProfilePageUsername"
        );

    const bio =
        document.getElementById(
            "chatProfilePageBio"
        );

    const profilePage =
        document.getElementById(
            "chatUserProfilePage"
        );



const friendCountElement =
    document.getElementById(
        "chatProfilePageFriendCount"
    );


    // =========================================
    // LOAD USER INFORMATION
    // =========================================

    try {

        const response =
            await fetch(
                `/api/user/${Number(user.id)}`
            );


        const result =
            await response.json();


        if (
            response.ok &&
            result.success &&
            result.user
        ) {

            currentChatUser = {

                id:
                    Number(result.user.id),

                name:
                    result.user.name || "",

                username:
                    result.user.username || "",

                profile_image:
                    result.user.profile_image ||
                    null,

                bio:
                    result.user.bio || ""

            };

        }

    } catch (error) {

        console.error(
            "Chat profile error:",
            error
        );

    }





    // =========================================
// LOAD FRIEND COUNT
// =========================================

try {

    const countResponse =
        await fetch(
            `/api/friends/count/${Number(user.id)}`
        );


    const countResult =
        await countResponse.json();


    if (
        countResponse.ok &&
        countResult.success
    ) {

        if (friendCountElement) {

            friendCountElement.textContent =
                `Friends: ${countResult.total}`;

        }

    } else {

        if (friendCountElement) {

            friendCountElement.textContent =
                "Friends: 0";

        }

    }

} catch (error) {

    console.error(
        "Friend count error:",
        error
    );


    if (friendCountElement) {

        friendCountElement.textContent =
            "Friends: 0";

    }

}


    // =========================================
    // SHOW INFORMATION
    // =========================================

    if (image) {

        image.src =
            currentChatUser.profile_image ||
            "/default-profile.png";

    }


    if (name) {

        name.textContent =
            currentChatUser.name ||
            "User";

    }


    if (username) {

        username.textContent =
            "@" +
            (
                currentChatUser.username ||
                ""
            );

    }


    if (bio) {

        bio.textContent =
            currentChatUser.bio ||
            "No bio yet";

    }


    // =========================================
    // HIDE CHAT
    // =========================================


    const desktopPageHost =
    document.getElementById("desktopPageHost");

if (
    window.innerWidth >= 600 &&
    desktopPageHost &&
    profilePage &&
    profilePage.parentElement !== desktopPageHost
) {
    desktopPageHost.appendChild(profilePage);
}

    if (chatSection) {

        chatSection.classList.remove(
            "active"
        );

    }


    // =========================================
    // HIDE OTHER PAGES
    // =========================================

    pages.forEach(page => {

        page.classList.remove(
            "active"
        );

    });


    // =========================================
    // SHOW USER PROFILE PAGE
    // =========================================

    if (profilePage) {

        profilePage.classList.add(
            "active"
        );

    }

}


const chatUserProfileBackBtn =
    document.getElementById(
        "chatUserProfileBackBtn"
    );


if (chatUserProfileBackBtn) {

    chatUserProfileBackBtn.addEventListener(
        "click",
        () => {

            const profilePage =
                document.getElementById(
                    "chatUserProfilePage"
                );


            if (profilePage) {

                profilePage.classList.remove(
                    "active"
                );

            }


            pages.forEach(page => {

                page.classList.remove(
                    "active"
                );

            });


            if (chatSection) {

                chatSection.classList.add(
                    "active"
                );

            }

        }
    );

}

// ==================================================
// FAVOURITE USER
// ==================================================

const favouriteUserBtn =
    document.getElementById(
        "favouriteUserBtn"
    );


function updateFavouriteButton() {

    if (
        !favouriteUserBtn ||
        !currentChatUser
    ) {

        return;

    }


    const favouriteKey =
        `favouriteUser_${getUserId()}`;


    const favouriteUserId =
        localStorage.getItem(
            favouriteKey
        );


    if (
        Number(favouriteUserId) ===
        Number(currentChatUser.id)
    ) {

        favouriteUserBtn.textContent =
            "⭐ Unfavourite";

    } else {

        favouriteUserBtn.textContent =
            "⭐ Favourite";

    }

}


if (favouriteUserBtn) {

    favouriteUserBtn.addEventListener(
        "click",
        () => {

            if (!currentChatUser) {

                return;

            }


            const favouriteKey =
                `favouriteUser_${getUserId()}`;


            const currentFavourite =
                localStorage.getItem(
                    favouriteKey
                );


            // ==================================================
            // UNFAVOURITE
            // ==================================================

            if (
                Number(currentFavourite) ===
                Number(currentChatUser.id)
            ) {

                localStorage.removeItem(
                    favouriteKey
                );


                favouriteUserBtn.textContent =
                    "⭐ Favourite";


                alert(
                    currentChatUser.name +
                    " removed from favourites."
                );


                return;

            }


            // ==================================================
            // FAVOURITE
            // ==================================================

            localStorage.setItem(
                favouriteKey,
                String(currentChatUser.id)
            );


            favouriteUserBtn.textContent =
                "⭐ Unfavourite";


            alert(
                currentChatUser.name +
                " added to favourites."
            );

        }
    );

}



// ==================================================
// DELETE CHAT FOR ME
// ==================================================

const deleteChatForMeBtn =
    document.getElementById(
        "deleteChatForMeBtn"
    );


if (deleteChatForMeBtn) {

    deleteChatForMeBtn.addEventListener(
        "click",
        async () => {

            // ==================================================
            // CHECK CURRENT CHAT
            // ==================================================

            if (!currentChatUser) {
                return;
            }


            const userId =
                Number(getUserId());


            const chatUserId =
                Number(currentChatUser.id);


            if (
                !userId ||
                !chatUserId
            ) {

                alert(
                    "Invalid user information."
                );

                return;

            }


            // ==================================================
            // CONFIRM
            // ==================================================

            const confirmed =
                confirm(
                    "Delete this chat for you?"
                );


            if (!confirmed) {
                return;
            }


            try {

                // ==================================================
                // DELETE REQUEST
                // ==================================================

                const response =
                    await fetch(
                        "/api/delete-chat-for-me",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                userId:
                                    userId,

                                chatUserId:
                                    chatUserId
                            })
                        }
                    );


                const result =
                    await response.json();


                // ==================================================
                // CHECK RESPONSE
                // ==================================================

                if (
                    !response.ok ||
                    !result.success
                ) {

                    alert(
                        result.message ||
                        "Failed to delete chat."
                    );

                    return;

                }


                // ==================================================
                // DELETE LOCAL PHONE MESSAGES
                // ==================================================

                const localKey =
                    `phone_messages_${userId}_${chatUserId}`;

                localStorage.removeItem(
                    localKey
                );


                // ==================================================
                // CLEAR CURRENT MESSAGES
                // ==================================================

                if (messages) {

                    messages.innerHTML = "";

                }


                // ==================================================
                // CLOSE CHAT PROFILE
                // ==================================================

                const chatProfilePage =
                    document.getElementById(
                        "chatUserProfilePage"
                    );


                if (chatProfilePage) {

                    chatProfilePage.classList.remove(
                        "active"
                    );

                }


                // ==================================================
                // CLOSE CHAT
                // ==================================================

                if (chatSection) {

                    chatSection.classList.remove(
                        "active"
                    );

                }


                document.body.classList.remove(
                    "chat-mode"
                );


                // ==================================================
                // RESET CURRENT CHAT
                // ==================================================

                currentChatUser =
                    null;


                // ==================================================
                // SHOW CHATS PAGE
                // ==================================================

                if (
                    typeof showPage ===
                    "function"
                ) {

                    showPage(
                        "friendsPage"
                    );

                }


                // ==================================================
                // UPDATE NAVIGATION
                // ==================================================

                document
                    .querySelectorAll(
                        ".nav-btn"
                    )
                    .forEach(
                        btn => {

                            btn.classList.remove(
                                "active"
                            );

                        }
                    );


                const chatsButton =
                    document.querySelector(
                        '[data-page="chatsPage"]'
                    );


                if (chatsButton) {

                    chatsButton.classList.add(
                        "active"
                    );

                }


                // ==================================================
                // RELOAD CHAT LIST
                // ==================================================

                if (
                    typeof loadChats ===
                    "function"
                ) {

                    await loadChats();

                }


                // ==================================================
                // SUCCESS MESSAGE
                // ==================================================

                alert(
                    "Chat deleted for you."
                );


            } catch (error) {

                console.error(
                    "Delete chat for me error:",
                    error
                );


                alert(
                    "Unable to connect to server."
                );

            }

        }
    );

}


const deleteChatForEveryoneBtn =
    document.getElementById(
        "deleteChatForEveryoneBtn"
    );

if (deleteChatForEveryoneBtn) {

    deleteChatForEveryoneBtn.addEventListener(
        "click",
        async () => {

            if (!currentChatUser) {
                return;
            }

            const userId =
                Number(getUserId());

            const chatUserId =
                Number(currentChatUser.id);

            if (!userId || !chatUserId) {
                alert(
                    "Invalid user information."
                );
                return;
            }

            const confirmed =
                confirm(
                    "Delete this entire chat for everyone?"
                );

            if (!confirmed) {
                return;
            }

            try {

                const response =
                    await fetch(
                        "/api/delete-chat-for-everyone",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                userId:
                                    userId,

                                chatUserId:
                                    chatUserId
                            })
                        }
                    );

                const result =
                    await response.json();

                if (
                    !response.ok ||
                    !result.success
                ) {

                    alert(
                        result.message ||
                        "Failed to delete chat."
                    );

                    return;
                }


                // REMOVE LOCAL CHAT
                const localKey =
                    `phone_messages_${userId}_${chatUserId}`;

                localStorage.removeItem(
                    localKey
                );


                // CLEAR MESSAGES
                if (messages) {
                    messages.innerHTML = "";
                }


                // GO BACK TO CHATS
                currentChatUser = null;

                document.body.classList.remove(
                    "chat-mode"
                );

                if (
                    typeof showPage ===
                    "function"
                ) {
                    showPage(
                        "chatsPage"
                    );
                }


                if (
                    typeof loadChats ===
                    "function"
                ) {
                    await loadFriends();
                }


                alert(
                    "Chat deleted for everyone."
                );

            } catch (error) {

                console.error(
                    "Delete chat for everyone error:",
                    error
                );

                alert(
                    "Unable to connect to server."
                );
            }

        }
    );

}

// ==================================================
// CHAT PROFILE PAGE IMAGE CLICK
// ==================================================

const chatProfilePageImage =
    document.getElementById(
        "chatProfilePageImage"
    );


if (chatProfilePageImage) {

    chatProfilePageImage.addEventListener(
        "click",
        () => {

            if (!currentChatUser) {

                return;

            }


            showUserProfilePopup(
                currentChatUser
            );

        }
    );

}







// ==================================================
// ACCOUNT CHANGE POPUP SYSTEM
// ==================================================

const accountChangeOverlay =
    document.getElementById("accountChangeOverlay");

const accountChangeTitle =
    document.getElementById("accountChangeTitle");

const accountChangeCloseBtn =
    document.getElementById("accountChangeCloseBtn");

const changeNameForm =
    document.getElementById("changeNameForm");

const changeUsernameForm =
    document.getElementById("changeUsernameForm");

const changePasswordForm =
    document.getElementById("changePasswordForm");


// ==================================================
// INPUTS
// ==================================================

const newNameInput =
    document.getElementById("newNameInput");

const newUsernameInput =
    document.getElementById("newUsernameInput");

const currentPasswordInput =
    document.getElementById("currentPasswordInput");

const newPasswordInput =
    document.getElementById("newPasswordInput");

const confirmPasswordInput =
    document.getElementById("confirmPasswordInput");


// ==================================================
// OPEN ACCOUNT CHANGE POPUP
// ==================================================

function openAccountChangePopup(type) {

    if (!accountChangeOverlay) {
        return;
    }


    // Hide all forms

    changeNameForm?.classList.remove("active");

    changeUsernameForm?.classList.remove("active");

    changePasswordForm?.classList.remove("active");


    // ==================================================
    // NAME
    // ==================================================

    if (type === "name") {

        accountChangeTitle.textContent =
            "Change Name";

        changeNameForm?.classList.add("active");


        if (newNameInput) {

            newNameInput.value =
                currentUser?.name || "";

            setTimeout(() => {
                newNameInput.focus();
            }, 100);

        }

    }


    // ==================================================
    // USERNAME
    // ==================================================

    if (type === "username") {

        accountChangeTitle.textContent =
            "Change Username";

        changeUsernameForm?.classList.add("active");


        if (newUsernameInput) {

            newUsernameInput.value =
                currentUser?.username || "";

            setTimeout(() => {
                newUsernameInput.focus();
            }, 100);

        }

    }


    // ==================================================
    // PASSWORD
    // ==================================================

    if (type === "password") {

        accountChangeTitle.textContent =
            "Change Password";

        changePasswordForm?.classList.add("active");


        if (currentPasswordInput) {
            currentPasswordInput.value = "";
        }

        if (newPasswordInput) {
            newPasswordInput.value = "";
        }

        if (confirmPasswordInput) {
            confirmPasswordInput.value = "";
        }


        setTimeout(() => {
            currentPasswordInput?.focus();
        }, 100);

    }


    accountChangeOverlay.classList.add("active");

}


// ==================================================
// CLOSE ACCOUNT CHANGE POPUP
// ==================================================

function closeAccountChangePopup() {

    if (!accountChangeOverlay) {
        return;
    }


    accountChangeOverlay.classList.remove("active");


    if (currentPasswordInput) {
        currentPasswordInput.value = "";
    }

    if (newPasswordInput) {
        newPasswordInput.value = "";
    }

    if (confirmPasswordInput) {
        confirmPasswordInput.value = "";
    }

}


// ==================================================
// CLOSE BUTTON
// ==================================================

if (accountChangeCloseBtn) {

    accountChangeCloseBtn.addEventListener(
        "click",
        closeAccountChangePopup
    );

}


// ==================================================
// CLICK OUTSIDE POPUP
// ==================================================

if (accountChangeOverlay) {

    accountChangeOverlay.addEventListener(
        "click",
        (event) => {

            if (
                event.target === accountChangeOverlay
            ) {

                closeAccountChangePopup();

            }

        }
    );

}


// ==================================================
// ESC KEY
// ==================================================

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape" &&
            accountChangeOverlay?.classList.contains("active")
        ) {

            closeAccountChangePopup();

        }

    }
);


// ==================================================
// CHANGE NAME BUTTON
// ==================================================

const changeNameBtn =
    document.getElementById("changeNameBtn");


if (changeNameBtn) {

    changeNameBtn.addEventListener(
        "click",
        () => {

            openAccountChangePopup("name");

        }
    );

}


// ==================================================
// SAVE NEW NAME
// ==================================================

const saveNewNameBtn =
    document.getElementById("saveNewNameBtn");


if (saveNewNameBtn) {

    saveNewNameBtn.addEventListener(
        "click",
        async () => {

            const name =
                newNameInput.value.trim();


            // EMPTY

            if (!name) {

                showChangeErrorPopup(
                    "Invalid Name",
                    "Name cannot be empty."
                );

                newNameInput.focus();

                return;

            }


            // TOO SHORT

            if (name.length < 2) {

                showChangeErrorPopup(
                    "Invalid Name",
                    "Name must be at least 2 characters."
                );

                newNameInput.focus();

                return;

            }


            // TOO LONG

            if (name.length > 50) {

                showChangeErrorPopup(
                    "Invalid Name",
                    "Name cannot be more than 50 characters."
                );

                newNameInput.focus();

                return;

            }


            saveNewNameBtn.disabled = true;

            saveNewNameBtn.textContent =
                "Saving...";


            try {

                const response =
                    await fetch(
                        "/api/change-name",
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    userId:
                                        getUserId(),

                                    newName:
                                        name

                                })

                        }
                    );


                const result =
                    await response.json();


                if (
                    !response.ok ||
                    !result.success
                ) {

                    showChangeErrorPopup(
                        "Unable to Change Name",
                        result.message ||
                        "Unable to change name."
                    );

                    return;

                }


                currentUser.name =
                    result.name || name;


                localStorage.setItem(
                    "user",
                    JSON.stringify(currentUser)
                );


                loadProfile();

                loadFriends();


                closeAccountChangePopup();


                showChangeSuccessPopup(
                    "Name Changed",
                    "Your name has been changed successfully."
                );


            } catch (error) {

                console.error(
                    "Change name error:",
                    error
                );


                showChangeErrorPopup(
                    "Connection Error",
                    "Unable to contact server."
                );

            } finally {

                saveNewNameBtn.disabled =
                    false;

                saveNewNameBtn.textContent =
                    "Save Name";

            }

        }
    );

}


// ==================================================
// CHANGE USERNAME BUTTON
// ==================================================

const changeUsernameButton =
    document.getElementById(
        "changeUsernameButton"
    );


if (changeUsernameButton) {

    changeUsernameButton.addEventListener(
        "click",
        () => {

            openAccountChangePopup("username");

        }
    );

}


// ==================================================
// SAVE NEW USERNAME
// ==================================================

const saveNewUsernameBtn =
    document.getElementById(
        "saveNewUsernameBtn"
    );


if (saveNewUsernameBtn) {

    saveNewUsernameBtn.addEventListener(
        "click",
        async () => {

            const username =
                newUsernameInput.value.trim();


            // EMPTY

            if (!username) {

                showChangeErrorPopup(
                    "Invalid Username",
                    "Username cannot be empty."
                );

                newUsernameInput.focus();

                return;

            }


            // TOO SHORT

            if (username.length < 3) {

                showChangeErrorPopup(
                    "Invalid Username",
                    "Username must be at least 3 characters."
                );

                newUsernameInput.focus();

                return;

            }


            // TOO LONG

            if (username.length > 30) {

                showChangeErrorPopup(
                    "Invalid Username",
                    "Username cannot be more than 30 characters."
                );

                newUsernameInput.focus();

                return;

            }


            saveNewUsernameBtn.disabled =
                true;

            saveNewUsernameBtn.textContent =
                "Saving...";


            try {

                const response =
                    await fetch(
                        "/api/change-username",
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    userId:
                                        getUserId(),

                                    newUsername:
                                        username

                                })

                        }
                    );


                const result =
                    await response.json();


                if (
                    !response.ok ||
                    !result.success
                ) {

                    showChangeErrorPopup(
                        "Unable to Change Username",
                        result.message ||
                        "Unable to change username."
                    );

                    return;

                }


                currentUser.username =
                    result.username ||
                    username;


                localStorage.setItem(
                    "user",
                    JSON.stringify(currentUser)
                );


                loadProfile();


                closeAccountChangePopup();


                showChangeSuccessPopup(
                    "Username Changed",
                    "Your username has been changed successfully."
                );


            } catch (error) {

                console.error(
                    "Change username error:",
                    error
                );


                showChangeErrorPopup(
                    "Connection Error",
                    "Unable to contact server."
                );

            } finally {

                saveNewUsernameBtn.disabled =
                    false;

                saveNewUsernameBtn.textContent =
                    "Save Username";

            }

        }
    );

}


// ==================================================
// CHANGE PASSWORD BUTTON
// ==================================================

const changePasswordBtn =
    document.getElementById(
        "changePasswordBtn"
    );


if (changePasswordBtn) {

    changePasswordBtn.addEventListener(
        "click",
        () => {

            openAccountChangePopup("password");

        }
    );

}


// ==================================================
// SAVE NEW PASSWORD
// ==================================================

const saveNewPasswordBtn =
    document.getElementById(
        "saveNewPasswordBtn"
    );


if (saveNewPasswordBtn) {

    saveNewPasswordBtn.addEventListener(
        "click",
        async () => {

            const currentPassword =
                currentPasswordInput.value;

            const newPassword =
                newPasswordInput.value;

            const confirmPassword =
                confirmPasswordInput.value;


            // CURRENT PASSWORD EMPTY

            if (!currentPassword.trim()) {

                showChangeErrorPopup(
                    "Password Required",
                    "Current password is required."
                );

                currentPasswordInput.focus();

                return;

            }


            // NEW PASSWORD EMPTY

            if (!newPassword.trim()) {

                showChangeErrorPopup(
                    "Password Required",
                    "New password is required."
                );

                newPasswordInput.focus();

                return;

            }


            // PASSWORD TOO SHORT

            if (newPassword.length < 6) {

                showChangeErrorPopup(
                    "Invalid Password",
                    "New password must be at least 6 characters."
                );

                newPasswordInput.focus();

                return;

            }


            // CONFIRM EMPTY

            if (!confirmPassword.trim()) {

                showChangeErrorPopup(
                    "Password Required",
                    "Please confirm your new password."
                );

                confirmPasswordInput.focus();

                return;

            }


            // PASSWORD NOT MATCHING

            if (
                newPassword !==
                confirmPassword
            ) {

                showChangeErrorPopup(
                    "Password Doesn't Match",
                    "New passwords do not match."
                );

                confirmPasswordInput.focus();

                return;

            }


            saveNewPasswordBtn.disabled =
                true;

            saveNewPasswordBtn.textContent =
                "Changing...";


            try {

                const response =
                    await fetch(
                        "/api/change-password",
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    userId:
                                        getUserId(),

                                    currentPassword:
                                        currentPassword,

                                    newPassword:
                                        newPassword

                                })

                        }
                    );


                const result =
                    await response.json();


                if (
                    !response.ok ||
                    !result.success
                ) {

                    showChangeErrorPopup(
                        "Password Change Failed",
                        result.message ||
                        "Password change failed."
                    );

                    return;

                }


                closeAccountChangePopup();


                showChangeSuccessPopup(
                    "Password Changed",
                    "Your password has been changed successfully."
                );


            } catch (error) {

                console.error(
                    "Change password error:",
                    error
                );


                showChangeErrorPopup(
                    "Connection Error",
                    "Unable to contact server."
                );

            } finally {

                saveNewPasswordBtn.disabled =
                    false;

                saveNewPasswordBtn.textContent =
                    "Change Password";

            }

        }
    );

}



















// ==================================================
// CHANGE SUCCESS POPUP
// ==================================================

const changeSuccessOverlay =
    document.getElementById(
        "changeSuccessOverlay"
    );

const changeSuccessCloseBtn =
    document.getElementById(
        "changeSuccessCloseBtn"
    );

const changeSuccessTitle =
    document.getElementById(
        "changeSuccessTitle"
    );

const changeSuccessMessage =
    document.getElementById(
        "changeSuccessMessage"
    );


// ==================================================
// SHOW SUCCESS POPUP
// ==================================================

function showChangeSuccessPopup(
    title,
    message
) {

    if (!changeSuccessOverlay) {
        return;
    }


    changeSuccessTitle.textContent =
        title || "Success";


    changeSuccessMessage.textContent =
        message ||
        "Your information has been changed successfully.";


    changeSuccessOverlay.classList.add(
        "active"
    );

}


// ==================================================
// CLOSE SUCCESS POPUP
// ==================================================

function closeChangeSuccessPopup() {

    if (!changeSuccessOverlay) {
        return;
    }


    changeSuccessOverlay.classList.remove(
        "active"
    );

}


// ==================================================
// CLOSE BUTTON
// ==================================================

if (changeSuccessCloseBtn) {

    changeSuccessCloseBtn.addEventListener(
        "click",
        closeChangeSuccessPopup
    );

}


// ==================================================
// CLICK OUTSIDE POPUP
// ==================================================

if (changeSuccessOverlay) {

    changeSuccessOverlay.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                changeSuccessOverlay
            ) {

                closeChangeSuccessPopup();

            }

        }
    );

}




// ==================================================
// CHANGE ERROR POPUP
// ==================================================

const changeErrorOverlay =
    document.getElementById(
        "changeErrorOverlay"
    );


const changeErrorCloseBtn =
    document.getElementById(
        "changeErrorCloseBtn"
    );


const changeErrorTitle =
    document.getElementById(
        "changeErrorTitle"
    );


const changeErrorMessage =
    document.getElementById(
        "changeErrorMessage"
    );


// ==================================================
// SHOW ERROR POPUP
// ==================================================

function showChangeErrorPopup(
    title,
    message
) {

    if (!changeErrorOverlay) {

        return;

    }


    changeErrorTitle.textContent =
        title || "Something went wrong";


    changeErrorMessage.textContent =
        message ||
        "Please check your information.";


    changeErrorOverlay.classList.add(
        "active"
    );

}


// ==================================================
// CLOSE ERROR POPUP
// ==================================================

function closeChangeErrorPopup() {

    if (!changeErrorOverlay) {

        return;

    }


    changeErrorOverlay.classList.remove(
        "active"
    );

}


// ==================================================
// CLOSE BUTTON
// ==================================================

if (changeErrorCloseBtn) {

    changeErrorCloseBtn.addEventListener(
        "click",
        closeChangeErrorPopup
    );

}


// ==================================================
// CLICK OUTSIDE POPUP
// ==================================================

if (changeErrorOverlay) {

    changeErrorOverlay.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                changeErrorOverlay
            ) {

                closeChangeErrorPopup();

            }

        }
    );

}





// ==================================================
// MESSAGE SAVE TYPE SYSTEM
// ==================================================


const savePhoneBtn =
    document.getElementById(
        "savePhoneBtn"
    );

const saveDatabaseBtn =
    document.getElementById(
        "saveDatabaseBtn"
    );

const dontSaveChatBtn =
    document.getElementById(
        "dontSaveChatBtn"
    );


// ==================================================
// OPEN MESSAGE SAVE POPUP
// ==================================================

function openMessageSavePopup() {

    if (!messageSaveOverlay) {
        return;
    }

    messageSaveOverlay.classList.add(
        "active"
    );

}


// ==================================================
// CLOSE MESSAGE SAVE POPUP
// ==================================================

function closeMessageSaveTypePopup() {

    if (!messageSaveOverlay) {
        return;
    }

    messageSaveOverlay.classList.remove(
        "active"
    );

}


if (closeMessageSavePopup) {

    closeMessageSavePopup.addEventListener(
        "click",
        closeMessageSaveTypePopup
    );

}


// ==================================================
// CLICK OUTSIDE
// ==================================================

if (messageSaveOverlay) {

    messageSaveOverlay.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                messageSaveOverlay
            ) {

                closeMessageSaveTypePopup();

            }

        }
    );

}


// ==================================================
// GET CURRENT MESSAGE SAVE TYPE
// ==================================================

async function loadMessageSaveType() {

    const userId =
        getUserId();

    if (!userId) {
        return;
    }


    try {

        const response =
            await fetch(
                `/api/message-save-type/${userId}`
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            console.error(
                "Unable to load message save type:",
                result.message
            );

            return;

        }


        if (currentUser) {

            currentUser.message_save_type =
                result.message_save_type;

            localStorage.setItem(
                "user",
                JSON.stringify(
                    currentUser
                )
            );

        }


        updateMessageSaveTypeButtons(
            result.message_save_type
        );


    } catch (error) {

        console.error(
            "Load message save type error:",
            error
        );

    }

}


// ==================================================
// UPDATE BUTTON STATUS
// ==================================================

function updateMessageSaveTypeButtons(
    type
) {

    if (savePhoneBtn) {

        savePhoneBtn.classList.toggle(
            "selected",
            type === "phone"
        );

    }


    if (saveDatabaseBtn) {

        saveDatabaseBtn.classList.toggle(
            "selected",
            type === "database"
        );

    }


    if (dontSaveChatBtn) {

        dontSaveChatBtn.classList.toggle(
            "selected",
            type === "none"
        );

    }

}


// ==================================================
// SAVE MESSAGE SAVE TYPE
// ==================================================

async function updateMessageSaveType(
    type
) {

    const userId =
        getUserId();


    if (!userId) {

        return false;

    }


    try {

        const response =
            await fetch(
                "/api/message-save-type",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            userId:
                                userId,

                            messageSaveType:
                                type

                        })

                }
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            showChangeErrorPopup(
                "Unable to Change Setting",
                result.message ||
                "Unable to change message save type."
            );

            return false;

        }


        if (currentUser) {

            currentUser.message_save_type =
                result.message_save_type;

            localStorage.setItem(
                "user",
                JSON.stringify(
                    currentUser
                )
            );

        }


        updateMessageSaveTypeButtons(
            type
        );


        return true;


    } catch (error) {

        console.error(
            "Update message save type error:",
            error
        );


        showChangeErrorPopup(
            "Connection Error",
            "Unable to contact server."
        );


        return false;

    }

}



// ==================================================
// SAVE CHAT IN DATABASE
// ==================================================

if (saveDatabaseBtn) {

    saveDatabaseBtn.addEventListener(
        "click",
        async () => {

            const success =
                await updateMessageSaveType(
                    "database"
                );


            if (success) {

                closeMessageSaveTypePopup();

                showChangeSuccessPopup(
                    "Database Save Enabled",
                    "Your chats will be saved in the SendMessage database."
                );

            }

        }
    );

}



// ==================================================
// SAVE CHAT IN PHONE
// ==================================================

if (savePhoneBtn) {

    savePhoneBtn.addEventListener(
        "click",
        () => {

            const confirmed =
                confirm(
                    "If you enable this mode, your chats will no longer be saved in the SendMessage database.\n\n" +
                    "Your chats with other users will still remain on their side.\n\n" +
                    "If you want to delete a chat for everyone, delete it before changing your phone.\n\n" +
                    "Do you want to continue?"
                );


            if (!confirmed) {

                return;

            }


            updateMessageSaveType(
                "phone"
            ).then(
                (success) => {

                    if (!success) {
                        return;
                    }


                    closeMessageSaveTypePopup();


                    showChangeSuccessPopup(
                        "Phone Save Enabled",
                        "Your chats will now be saved on your phone instead of the SendMessage database."
                    );

                }
            );

        }
    );

}




// ==================================================
// DON'T SAVE CHAT
// ==================================================

if (dontSaveChatBtn) {

    dontSaveChatBtn.addEventListener(
        "click",
        () => {

            const confirmed =
                confirm(
                    " Warning!\n\n" +
                    "No chats will be saved when this mode is enabled.\n\n" +
                    "After you send a chat, refreshing the page will delete the chat from your view.\n\n" +
                    "This action may affect both sides of the conversation.\n\n" +
                    "Do you want to continue?"
                );


            if (!confirmed) {

                return;

            }


            updateMessageSaveType(
                "none"
            ).then(
                (success) => {

                    if (!success) {
                        return;
                    }


                    closeMessageSaveTypePopup();


                    showChangeSuccessPopup(
                        "Don't Save Chat Enabled",
                        "Your chats will not be saved."
                    );

                }
            );

        }
    );

}




// ==================================================
// INITIAL PAGE
// ==================================================

showPage("friendsPage");


// ==================================================
// INITIAL BROWSER STATE
// ==================================================

try {

    window.history.replaceState(
        { pageId: "friendsPage" },
        "",
        ""
    );

    isInitialNav = false;

} catch (error) {

    console.log(
        "Initial history state error:",
        error
    );

}



// ==================================================
// CHAT CONTEXT MENU — RIGHT CLICK (DESKTOP)
// ==================================================

document.addEventListener(
    "contextmenu",
    (event) => {

        const chatSectionEl =
            document.getElementById("chatSection");


        if (
            !chatSectionEl ||
            !chatSectionEl.classList.contains("active")
        ) {
            return;
        }


        // Don't trigger on message (message has its own menu)

        if (
            event.target.closest(".message")
        ) {

            return;

        }


        // Only on chat area

        if (
            !event.target.closest(".chat-section")
        ) {

            return;

        }


        event.preventDefault();


        openChatContextMenu(
            event.clientX,
            event.clientY
        );

    }
);


// ==================================================
// CHAT CONTEXT MENU — LONG PRESS (MOBILE)
// ==================================================

let chatLongPressTimer = null;

let chatLongPressTriggered = false;


document.addEventListener(
    "touchstart",
    (event) => {

        const chatSectionEl =
            document.getElementById("chatSection");


        if (
            !chatSectionEl ||
            !chatSectionEl.classList.contains("active")
        ) {
            return;
        }


        // Ignore touches on messages (they have their own menu)

        if (
            event.target.closest(".message")
        ) {

            return;

        }


        if (
            !event.target.closest(".chat-section")
        ) {

            return;

        }


        const touch =
            event.touches[0];


        chatLongPressTriggered = false;


        chatLongPressTimer =
            setTimeout(() => {

                chatLongPressTriggered = true;


                openChatContextMenu(
                    touch.clientX,
                    touch.clientY
                );

            }, 2000);

    },
    { passive: true }
);


document.addEventListener(
    "touchend",
    () => {

        clearTimeout(chatLongPressTimer);

    }
);


document.addEventListener(
    "touchmove",
    () => {

        clearTimeout(chatLongPressTimer);

    }
);


// ==================================================
// CHAT SEARCH — INPUT HANDLER
// ==================================================

const chatSearchInputEl =
    document.getElementById("chatSearchInput");


if (chatSearchInputEl) {

    chatSearchInputEl.addEventListener(
        "input",
        () => {

            performChatSearch(
                chatSearchInputEl.value
            );


            scrollToFirstMatch();

        }
    );

}


// ==================================================
// CHAT SEARCH — CLOSE BUTTON
// ==================================================

const closeChatSearchBtn =
    document.getElementById(
        "closeChatSearchBtn"
    );


if (closeChatSearchBtn) {

    closeChatSearchBtn.addEventListener(
        "click",
        closeChatSearch
    );

}


// ==================================================
// UPDATE MESSAGES QUERY (PASS VIEWER)
// ==================================================

// Note: loadMessages uses /api/messages/:user1/:user2
// We pass current user as user1 always

// ==================================================
// ESCAPE TO CLOSE SEARCH
// ==================================================

document.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Escape" && chatSearchActive) {

            closeChatSearch();

        }

    }
);

// ==================================================
// GLOBAL IMAGE FALLBACK
// ==================================================

document.addEventListener(
    "error",
    function (event) {
        const target = event.target;
        if (target && target.tagName === "IMG") {
            if (target.src !== location.origin + "/default-profile.png") {
                target.src = "/default-profile.png";
                target.onerror = null;
            }
        }
    },
    true
);


// ==================================================
// STARTUP
// ==================================================

showSearchHistory();

loadProfile();

loadFriends();

loadFriendCount();

loadChats();

loadNotifications();

loadMessageSaveType();


console.log(
    "SendMessage user.js loaded successfully."
);