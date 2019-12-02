class Ui {
    private navigateLis : NodeListOf<HTMLElement>;

    constructor (){
        this.navigateLis = document.querySelectorAll<HTMLElement>("body > main > div.nav-bar > ul > li");
        console.log(this.navigateLis);
        this.InitLiClicks();
    }

    private InitLiClicks() {
        for (let i = 0; i < this.navigateLis.length; i++){
            this.navigateLis[i].addEventListener("click", (event : MouseEvent) => {
                this.DisableActiveClass();
                this.AddActiveClass(event.target as HTMLElement);
            })
        }
    }
    private DisableActiveClass(){
        this.navigateLis.forEach(function(el : HTMLElement){
            el.classList.forEach(function(oneClass : string){
                if (oneClass == "active"){
                    el.classList.remove("active");
                }
            })
        })
    }
    private AddActiveClass(node : HTMLElement){
        console.log(node);
        node.classList.add("active");
    }
}

var firstScreen = new Ui();


class Tournament{
    private amountOfTeams : number;

    public getAmountOfTeams() : number{
        return this.amountOfTeams;
    }
}