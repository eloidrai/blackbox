const VIDE = 0, DEVIE = 1, REFLECHI = 2, ABSORBE = 3, ATOME = 4;

class BlackBox {
    constructor(L, l, nbAtomes){
        this.L = L, this.l = l, this.nbAtomes = nbAtomes;
        this.creerGrille(this.L, this.l, this.nbAtomes);
        console.log("La partie peut commencer !");
    }
    
    creerGrille(L, l, nbAtomes){
        /* Création du plateau */
        this.grille = Array(l+2).fill().map(e=>Array(L+2).fill().map(e=>{return {statut: VIDE};})); // Génère une grille avec un contour
        for (let c=1; c<=(L+l)*2; c++){
            if (c<=l){                          // Bord gauche
                this.grille[c][0].nb = c;
            } else if (c<=l+L){                 // Bas
                this.grille[l+1][c-l].nb = c;
            } else if (c<=l+L+l){               // Bord droit
                this.grille[l-(c-l-L)+1][L+1].nb = c;
            } else {                            // Haut
                this.grille[0][L-(c-l-L-l)+1].nb = c;
            }
        }
        this.grille[0][0].nb = NaN, this.grille[l+1][0].nb = NaN, this.grille[l+1][L+1].nb = NaN, this.grille[0][L+1].nb = NaN; // On ne peut pas aller derrière les coins
        
        /* Placement des atomes */
        for (let i=0; i<nbAtomes; i++){
            const vides = [];
            for (let y=1; y<l+1; y++) for (let x=1; x<L+1; x++) if (this.grille[y][x].statut !== ATOME) vides.push({x:x, y:y});     // Toutes les cases où il n'y a pas d'atomes
            const nouvelAtome = vides[Math.floor(Math.random()*vides.length)];
            this.grille[nouvelAtome.y][nouvelAtome.x].statut = ATOME;
            for (let x = nouvelAtome.x-1; x<=nouvelAtome.x+1; x++) for (let y = nouvelAtome.y-1; y<=nouvelAtome.y+1; y++) if (this.grille[y][x].statut !== ATOME) {     // Champ de l'atome
                if (x===nouvelAtome.x || y===nouvelAtome.y){
                    this.grille[y][x].statut = ABSORBE;              // Les cases sur lesquelles on est absorbé
                } else {
                     // Réfléchi si deux champs se chevauchent ou si on n'est pas sur le plateau
                    if (this.grille[y][x].statut === DEVIE || typeof this.grille[y][x].nb === "number") this.grille[y][x].statut = REFLECHI;
                    if (this.grille[y][x].statut === VIDE) this.grille[y][x].statut = DEVIE;
                    
                }
            }
        }
    }
}


// Débogage

function afficherGrille(g){
    let html = "<table>"
    for (let y in g) {
        html+="<tr>";
        for (let x in g[y]){
            html+=`<td class="${(typeof g[y][x].nb === "number")? "gris": ""}">`+g[y][x].statut+"</td>";
        }
        html+="</tr>";
    }
    html+= "</table>";
    document.body.innerHTML = html;
}

afficherGrille((new BlackBox(4,4, 2)).grille)