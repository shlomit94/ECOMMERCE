//DOM
let navContainer = document.querySelector('.nav-container');
let bagIconBtn = document.querySelector(".cart-btn");
let productsContainer = document.querySelector(".products-container");
let cartContainer = document.querySelector(".cart-container");
let cartElement = document.querySelector(".cart");
let cartContent = document.querySelector(".cart-content");
let numberOfItems = document.querySelector(".cart-items");
let closeCartBtn = document.querySelector(".close-cart");
let clearCartBtn = document.querySelector(".clear-cart");
let cartTotal = document.querySelector(".cart-total");
let searchInput = document.querySelector('input');


let cart = [];
let buttonsElement = [];

class Products {
    //getting the products from local api
    async getProdacts() {
        let res = await fetch("products.json");
        let data = await res.json();
        let products = data.items;


        Storage.saveProducts(products);
        this.displayProducts(products);

        return products;
    }

    //display products from local api or filtered pruducts
    displayProducts(products) {
        let res = "";
        products.forEach((product) => {
            res += `<div class="single-product-container">
               <div class="img-container position-relative overflow-hidden">
                    <img src=${product.image} alt="product img" class="product-img d-block w-100">
                    <button class="bag-btn position-absolute fw-bold" data-id=${product.id}>
                        <i class="fas fa-shopping-cart"></i> Add to cart
                    </button>
                </div>
                <h3 class="text-center fw-bold">${product.title}</h3>
                <h4 class="text-center fw-bold">$${product.price}</h4>
            </div>`;
        });
        productsContainer.innerHTML = res;
        this.getCartBtns();
        this.cartLogic();
    }

    //get all the add-to-cart btn an add logic
    getCartBtns() {
        //turn nodelist to an array
        let cartBtns = [...document.querySelectorAll(".bag-btn")];
        buttonsElement = cartBtns;
        cartBtns.forEach((btn) => {
            //foreach btn get me the data id
            let productId = btn.dataset.id;
            //chek if this id includes in the cart
            let inCart = cart.find((item) => item.id == productId);
            if (inCart) {
                btn.innerText = 'In Cart';
                btn.disabled = true;
                //if its not in the cart its meen we didnt add it to the cart already so here is the logic
            } else {
                btn.addEventListener("click", (e) => {
                    e.target.innerText = "In Cart";
                    e.target.disabled = true;
                    let cartItem = {...Storage.getChosenProduct(productId), amount: 1 };
                    cart = [...cart, cartItem];
                    //save the product that added to the cart in local storage
                    Storage.savaCart(cart);

                    this.setCartValues(cart);
                    this.displayCartItems(cartItem);
                });
            }
        });
    }

    //create the visual cart and show it with showCart function
    displayCartItems(item) {
        cartContent.innerHTML += `<div class="cart-item d-grid text-center">
        <img src=${item.image} alt=product}/>
        <div class="products-details text-start">
            <h4>${item.title}</h4>
            <h5>$${item.price}</h5>
            <span class="remove-item" data-id=${item.id}>remove</span>
        </div>
        <div>
        <i class="fas fa-chevron-up" data-id=${item.id}></i>
        <p class="item-amount mb-0">${item.amount}</p>
        <i class="fas fa-chevron-down" data-id=${item.id}></i>
        </div>
    </div>`;
        this.showCart(item);
    }

    //update the current total price and the current number of items in the cart
    setCartValues(cart) {
        let currTotalPrice = 0;
        let itemsTotal = 0;
        cart.map((item) => {
            currTotalPrice += item.price * item.amount;
            itemsTotal += item.amount;
        });
        cartTotal.innerText = Number(currTotalPrice.toFixed(2));
        numberOfItems.innerText = itemsTotal;
    }


    showCart() {
        cartContainer.classList.remove("visually-hidden");
        cartContainer.classList.add("transpatentBg");
        cartElement.classList.add("show-cart");
    }

    hideCart() {
        cartContainer.classList.add("visually-hidden");
        cartContainer.classList.remove("transpatentBg");
        cartElement.classList.remove("show-cart");
    }

    //chek the state of the cart and updat it with the other functions when we log to the website
    loginState() {
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        this.getProdacts();
        bagIconBtn.addEventListener("click", this.savaCart);
        closeCartBtn.addEventListener("click", this.hideCart);
    }

    populateCart(cart) {
        cart.forEach((item) => this.displayCartItems(item));
    }

    cartLogic() {
        //clear cart-btn delete all the products in the cart
        clearCartBtn.addEventListener("click", () => {
            this.clearCart();
        });
        //cart functioality- using event bubeling
        cartContent.addEventListener('click', (e) => {
            this.eventBubeleInCart(e.target);

        })
    }

    eventBubeleInCart(e) {
        let id = e.dataset.id;
        let CurrItem = cart.find(item => item.id == id);
        if (e.classList.contains('remove-item')) {
            cartContent.removeChild(e.parentElement.parentElement);
            this.removeItems(id);
        } else if (e.classList.contains('fa-chevron-up')) {
            CurrItem.amount++;
            e.nextElementSibling.innerText = CurrItem.amount;

        } else if (e.classList.contains('fa-chevron-down')) {
            CurrItem.amount--;
            if (CurrItem.amount > 0) {
                e.previousElementSibling.innerText = CurrItem.amount;
            } else {
                cartContent.removeChild(e.parentElement.parentElement);
                this.removeItems(id);
            }

        }
        //saving the cart with the new amount in local storage
        Storage.savaCart(cart);
        //update the new values of the cart
        this.setCartValues(cart);
    }

    //delete all the items in the cart
    clearCart() {
        //get all the cart-items that includes the id of the product i want to delete
        let cartItems = cart.map((item) => item.id);
        //for every id remove from the dom-cart
        cartItems.forEach((id) => this.removeItems(id));
        //remove items from the DOM
        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0]);
        }
        this.hideCart();
    }

    //update  the local storage and the global cart array with only the remeining items
    removeItems(id) {
        //update the cart with all the items that i didnt choose to delete with data id
        cart = cart.filter((item) => item.id !== id);
        //update the current values after the filter
        this.setCartValues(cart);
        //save the new cart after removing all products or specific one with data id
        Storage.savaCart(cart);

        let btn = this.getBtnId(id);
        btn.disabled = false;
        btn.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
    }

    getBtnId(id) {
        return buttonsElement.find((button) => button.dataset.id == id);
    }

    //filter products after we wait for the products to load
    async filterdProducts(inputValue) {
        let items = await this.getProdacts();
        let filtered = items.filter(product => {
            return product.title.toLowerCase().includes(inputValue);
        })
        this.displayProducts(filtered);
        console.log(filtered);
    }
}


class Storage {
    //saving all products to local storage
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }

    //find all the details of the chosen product with the data-id of the add to cart btn
    static getChosenProduct(id) {
            let products = JSON.parse(localStorage.getItem("products"));
            let findProduct = products.find((product) => product.id == id);
            return findProduct;
        }
        //save current cart
    static savaCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    static getCart() {
        return localStorage.getItem("cart") ?
            JSON.parse(localStorage.getItem("cart")) : [];
    }
}

document.addEventListener("DOMContentLoaded", () => {
    let products = new Products();
    products.loginState();

    bagIconBtn.addEventListener('click', () => {
        products.showCart();
    })

    searchInput.addEventListener('keypress', () => {
        products.filterdProducts(searchInput.value);
    })
});

// window.onscroll = function() {
//     var top = window.scrollY;
//     if (top > 480) {
//         navContainer.style.background = 'whitesmoke';
//     } else {
//         navContainer.style.background = 'transparent'
//     }
// }













// const client = contentful.createClient({
//     // This is the space ID. A space is like a project folder in Contentful terms
//     space: "81n55kn5nvki",
//     // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
//     accessToken: "vLmTiG5BE1UiT1c5GBdn3IKoFRzEnNhPL3K3rKmIAjg"
// });
// console.log(client);
// let contectful = await client.getEntries({
//     content_type: "vintageTreasures"
// });
// console.log(contectful);