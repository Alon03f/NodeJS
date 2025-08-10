const API = "/api";
const token = localStorage.getItem("token");

const signupForm = document.getElementById("signupForm");
if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const body = {
            name: {
                first: document.getElementById("firstName").value,
                last: document.getElementById("lastName").value,
            },
            email: document.getElementById("email").value,
            password: document.getElementById("password").value,
            phone: document.getElementById("phone").value,
            isBusiness: document.getElementById("isBusiness")?.checked || false,
            address: {
                country: "ישראל",
                city: "תל אביב",
                street: "הרצל",
                houseNumber: 10,
                zip: 12345,
            },
        };

        try {
            const res = await fetch(`${API}/users`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (res.ok) {
                alert("נרשמת בהצלחה!");
                window.location.href = "login.html";
            } else {
                alert(data.message || "שגיאה בהרשמה");
            }
        } catch (error) {
            console.error("Signup error:", error);
            alert("שגיאה בהרשמה");
        }
    });
}

const cardsContainer = document.getElementById("cardsContainer");
if (cardsContainer) {
    loadAllCards();
}

async function loadAllCards() {
    try {
        const res = await fetch(`${API}/cards`);
        const cards = await res.json();
        cardsContainer.innerHTML = "";

        cards.forEach((card) => {
            const div = document.createElement("div");
            div.className = "card";

            const imageUrl = typeof card.image === 'string' ? card.image : card.image?.url || "https://cdn.pixabay.com/photo/2016/04/01/10/11/avatar-1299895_960_720.png";
            const imageAlt = typeof card.image === 'string' ? card.title : card.image?.alt || card.title;

            const isLiked = token && card.likes && Array.isArray(card.likes) && card.likes.includes(getCurrentUserId());
            const likeButtonClass = isLiked ? "like-btn liked" : "like-btn";

            div.innerHTML = `
                <img src="${imageUrl}" alt="${imageAlt}" class="card-image" onerror="this.src='https://cdn.pixabay.com/photo/2016/04/01/10/11/avatar-1299895_960_720.png'" />
                <div class="card-content">
                    <h2>${card.title}</h2>
                    <h4>${card.subtitle}</h4>
                    <p>${card.description}</p>
                    <p><b>טלפון:</b> ${card.phone}</p>
                    <p><b>אימייל:</b> ${card.email}</p>
                    <p><b>עיר:</b> ${card.address.city}</p>
                    <p><b>רחוב:</b> ${card.address.street} ${card.address.houseNumber}</p>
                    ${card.web ? `<p><b>אתר:</b> <a href="${card.web}" target="_blank">${card.web}</a></p>` : ''}
                    <div class="card-actions">
                        ${token ? `<button onclick="toggleLike('${card._id}')" class="${likeButtonClass}">❤️ ${card.likes?.length || 0}</button>` : ''}
                    </div>
                </div>
            `;
            cardsContainer.appendChild(div);
        });
    } catch (err) {
        cardsContainer.innerHTML = "<p>שגיאה בטעינת כרטיסים</p>";
        console.error(err);
    }
}

const myCardsContainer = document.getElementById("myCardsContainer");
if (myCardsContainer) {
    loadMyCards();
}

async function loadMyCards() {
    try {
        if (!token) {
            window.location.href = "login.html";
            return;
        }

        const res = await fetch(`${API}/cards/my-cards`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (res.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "login.html";
            return;
        }

        const cards = await res.json();
        myCardsContainer.innerHTML = "";

        if (cards.length === 0) {
            document.getElementById("noCardsMessage").style.display = "block";
            return;
        }

        cards.forEach((card) => {
            const div = document.createElement("div");
            div.className = "card";

            const imageUrl = typeof card.image === 'string' ? card.image : card.image?.url || "https://cdn.pixabay.com/photo/2016/04/01/10/11/avatar-1299895_960_720.png";
            const imageAlt = typeof card.image === 'string' ? card.title : card.image?.alt || card.title;

            div.innerHTML = `
                <img src="${imageUrl}" alt="${imageAlt}" class="card-image" onerror="this.src='https://cdn.pixabay.com/photo/2016/04/01/10/11/avatar-1299895_960_720.png'" />
                <div class="card-content">
                    <h2>${card.title}</h2>
                    <h4>${card.subtitle}</h4>
                    <p>${card.description}</p>
                    <p><b>טלפון:</b> ${card.phone}</p>
                    <p><b>אימייל:</b> ${card.email}</p>
                    <p><b>עיר:</b> ${card.address.city}</p>
                    <p><b>רחוב:</b> ${card.address.street} ${card.address.houseNumber}</p>
                    ${card.web ? `<p><b>אתר:</b> <a href="${card.web}" target="_blank">${card.web}</a></p>` : ''}
                    <div class="card-actions">
                        <button onclick="deleteCard('${card._id}')" class="delete-btn">מחק כרטיס</button>
                        <span class="likes">❤️ ${card.likes?.length || 0}</span>
                    </div>
                </div>
            `;
            myCardsContainer.appendChild(div);
        });
    } catch (err) {
        myCardsContainer.innerHTML = "<p>שגיאה בטעינת הכרטיסים שלך</p>";
        console.error(err);
    }
}

const favoriteCardsContainer = document.getElementById("favoriteCardsContainer");
if (favoriteCardsContainer) {
    loadFavoriteCards();
}

async function loadFavoriteCards() {
    try {
        if (!token) {
            window.location.href = "login.html";
            return;
        }

        const res = await fetch(`${API}/cards/favorites`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (res.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "login.html";
            return;
        }

        const cards = await res.json();
        favoriteCardsContainer.innerHTML = "";

        if (cards.length === 0) {
            const noFavoritesMessage = document.getElementById("noFavoritesMessage");
            if (noFavoritesMessage) {
                noFavoritesMessage.style.display = "block";
            }
            return;
        }

        cards.forEach((card) => {
            const div = document.createElement("div");
            div.className = "card";

            const imageUrl = typeof card.image === 'string' ? card.image : card.image?.url || "https://cdn.pixabay.com/photo/2016/04/01/10/11/avatar-1299895_960_720.png";
            const imageAlt = typeof card.image === 'string' ? card.title : card.image?.alt || card.title;

            div.innerHTML = `
                <img src="${imageUrl}" alt="${imageAlt}" class="card-image" onerror="this.src='https://cdn.pixabay.com/photo/2016/04/01/10/11/avatar-1299895_960_720.png'" />
                <div class="card-content">
                    <h2>${card.title}</h2>
                    <h4>${card.subtitle}</h4>
                    <p>${card.description}</p>
                    <p><b>טלפון:</b> ${card.phone}</p>
                    <p><b>אימייל:</b> ${card.email}</p>
                    <p><b>עיר:</b> ${card.address.city}</p>
                    <p><b>רחוב:</b> ${card.address.street} ${card.address.houseNumber}</p>
                    ${card.web ? `<p><b>אתר:</b> <a href="${card.web}" target="_blank">${card.web}</a></p>` : ''}
                    <div class="card-actions">
                        <button onclick="toggleLike('${card._id}')" class="like-btn liked">❤️ ${card.likes?.length || 0}</button>
                    </div>
                </div>
            `;
            favoriteCardsContainer.appendChild(div);
        });
    } catch (err) {
        favoriteCardsContainer.innerHTML = "<p>שגיאה בטעינת הכרטיסים המועדפים</p>";
        console.error(err);
    }
}

const createCardForm = document.getElementById("createCardForm");
if (createCardForm) {
    createCardForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!token) {
            alert("יש להתחבר כדי ליצור כרטיס");
            window.location.href = "login.html";
            return;
        }

        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            if (!payload.isBusiness) {
                alert("רק משתמשי עסק יכולים ליצור כרטיסים");
                window.location.href = "index.html";
                return;
            }
        } catch (error) {
            console.error("Error parsing token:", error);
            alert("שגיאה באימות הטוקן");
            window.location.href = "login.html";
            return;
        }

        const formData = {
            title: document.getElementById("title").value.trim(),
            subtitle: document.getElementById("subtitle").value.trim(),
            description: document.getElementById("description").value.trim(),
            phone: document.getElementById("phone").value.trim(),
            email: document.getElementById("email").value.trim(),
            web: document.getElementById("web").value.trim() || "",
            image: document.getElementById("image").value.trim() || "",
            address: {
                state: document.getElementById("state").value.trim() || "",
                country: document.getElementById("country").value.trim(),
                city: document.getElementById("city").value.trim(),
                street: document.getElementById("street").value.trim(),
                houseNumber: parseInt(document.getElementById("houseNumber").value) || 1,
                zip: parseInt(document.getElementById("zip").value) || 0,
            },
        };

        console.log("Sending card data:", formData);

        try {
            const res = await fetch(`${API}/cards`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            console.log("Server response:", data);

            if (res.status === 401) {
                localStorage.removeItem("token");
                alert("יש להתחבר מחדש");
                window.location.href = "login.html";
            } else if (res.status === 403) {
                alert("רק משתמשי עסק יכולים ליצור כרטיסים");
            } else if (res.status === 201) {
                alert("כרטיס נוצר בהצלחה!");
                window.location.href = "my_cards.html";
            } else {
                console.error("Card creation failed:", res.status, data);
                alert(data.message || "שגיאה ביצירת כרטיס");
            }
        } catch (error) {
            console.error("Create card error:", error);
            alert("שגיאה ביצירת כרטיס");
        }
    });
}

async function deleteCard(cardId) {
    if (!confirm("האם אתה בטוח שברצונך למחוק את הכרטיס?")) {
        return;
    }

    try {
        const res = await fetch(`${API}/cards/${cardId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (res.ok) {
            alert("הכרטיס נמחק בהצלחה!");
            loadMyCards();
        } else {
            alert("שגיאה במחיקת הכרטיס");
        }
    } catch (error) {
        console.error("Delete card error:", error);
        alert("שגיאה במחיקת הכרטיס");
    }
}

async function toggleLike(cardId) {
    if (!token) {
        alert("יש להתחבר כדי לסמן לייק");
        return;
    }

    try {
        const res = await fetch(`${API}/cards/${cardId}/like`, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (res.ok) {
            if (cardsContainer) {
                loadAllCards();
            }
            if (favoriteCardsContainer) {
                loadFavoriteCards();
            }
        } else {
            alert("שגיאה בסימון לייק");
        }
    } catch (error) {
        console.error("Like card error:", error);
        alert("שגיאה בסימון לייק");
    }
}

function getCurrentUserId() {
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.id;
    } catch (error) {
        console.error("Error parsing token:", error);
        return null;
    }
}

function isBusinessUser() {
    if (!token) return false;
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.isBusiness === true;
    } catch (error) {
        return false;
    }
}

const logoutLink = document.getElementById("logoutLink");
if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("token");
        alert("התנתקת בהצלחה");
        window.location.href = "login.html";
    });
}

window.addEventListener("DOMContentLoaded", () => {
    const loginLink = document.getElementById("loginLink");
    const logoutLink = document.getElementById("logoutLink");
    const createCardBtn = document.getElementById("createCardBtn");

    if (token) {
        if (loginLink) loginLink.style.display = "none";
        if (logoutLink) logoutLink.style.display = "inline";

        if (isBusinessUser()) {
            const nav = document.querySelector(".nav-links");

            const myCardsExists = document.getElementById("myCardsLink");
            if (!myCardsExists && nav) {
                const myCardsLink = document.createElement("a");
                myCardsLink.id = "myCardsLink";
                myCardsLink.href = "my_cards.html";
                myCardsLink.textContent = "הכרטיסים שלי";
                nav.insertBefore(myCardsLink, loginLink || logoutLink);
            }

            if (createCardBtn) {
                createCardBtn.style.display = "block";
            }
        } else {
            if (createCardBtn) {
                createCardBtn.style.display = "none";
            }
        }

        const nav = document.querySelector(".nav-links");
        const favoritesExists = document.getElementById("favoritesLink");
        if (!favoritesExists && nav) {
            const favoritesLink = document.createElement("a");
            favoritesLink.id = "favoritesLink";
            favoritesLink.href = "favorites.html";
            favoritesLink.textContent = "כרטיסים מועדפים";
            nav.insertBefore(favoritesLink, loginLink || logoutLink);
        }
    } else {
        if (loginLink) loginLink.style.display = "inline";
        if (logoutLink) logoutLink.style.display = "none";
        if (createCardBtn) createCardBtn.style.display = "none";
    }
});