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

        var table : HTMLElement = document.querySelector("body > main > div.content > table") as HTMLElement;
        var statistics : HTMLElement = document.querySelector("body > main > div.content > div.tournament-statistics") as HTMLElement;
        var settings : HTMLElement = document.querySelector("body > main > div.content > div.tournament-settings") as HTMLElement;

        if (node.getAttribute("data-type") === table.getAttribute("data-type")){
            this.ShowClicked(table, statistics, settings);
            this.Request("/show-table");
        }
        else if (node.getAttribute("data-type") === statistics.getAttribute("data-type")){
            this.ShowClicked(statistics, table, settings);
        }
        else if (node.getAttribute("data-type") === settings.getAttribute("data-type")){
            this.ShowClicked(settings, table, statistics);
        }
        
    }

    private ShowClicked(activeNode : HTMLElement, displayNoneFirst : HTMLElement, displayNoneSecond : HTMLElement){
        if (activeNode.style.display === "none"){
            activeNode.style.display = "";
        }
        if (displayNoneFirst.style.display === ""){
            displayNoneFirst.style.display = "none";
        }
        if (displayNoneSecond.style.display === ""){
            displayNoneSecond.style.display = "none";
        }

    }

    private Request(url : string){
        var condition : Number = 0;


        $.get( url )
        .done(function( data : object ) {
            
        })
        .fail(function(){
            
        })

    }
}

var firstScreen = new Ui();