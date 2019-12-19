const VIDE = 0, DEVIE = 1, REFLECHI = 2, ABSORBE = 3, ATOME = 4;

class BlackBox {
    constructor(L, l, nbAtomes){
        this.L = L, this.l = l;
        this.grille = this.creerGrille(L, l, nbAtomes);
        console.log("La partie peut commencer !");
    }
    
    /* Méthode de mise en place du jeu */
    creerGrille(L, l, nbAtomes){
        let grille = Array(l+2).fill().map(e=>Array(L+2).fill().map(e=>{return {statut: VIDE};})); // Génère une grille avec un contour
        for (let c=1; c<=(L+l)*2; c++){
            if (c<=l){                          // Bord gauche
                grille[c][0].nb = c;
            } else if (c<=l+L){                 // Bas
                grille[l+1][c-l].nb = c;
            } else if (c<=l+L+l){               // Bord droit
                grille[l-(c-l-L)+1][L+1].nb = c;
            } else {                            // Haut
                grille[0][L-(c-l-L-l)+1].nb = c;
            }
        }
        grille[0][0].nb = NaN, grille[l+1][0].nb = NaN, grille[l+1][L+1].nb = NaN, grille[0][L+1].nb = NaN; // On ne peut pas aller derrière les coins

        function coorVides(grille){            // Trouve les coordonnées des cases vides
            let vides = [];
            for (let y=1; y<l+1; y++) for (let x=1; x<L+1; x++) if (grille[y][x].statut !== ATOME) vides.push({x:x, y:y});  // Toutes les cases où il n'y a pas d'atomes
            return vides;
        }
        
        for (let i=0; i<nbAtomes; i++){
            let vides = coorVides(grille);
            let nouvelAtome = vides[Math.floor(Math.random()*vides.length)];
            grille[nouvelAtome.y][nouvelAtome.x].statut = ATOME;
            for (let x = nouvelAtome.x-1; x<=nouvelAtome.x+1; x++) for (let y = nouvelAtome.y-1; y<=nouvelAtome.y+1; y++){
                if (grille[y][x].statut !== ATOME){
                    if (x===nouvelAtome.x || y===nouvelAtome.y){
                        grille[y][x].statut = ABSORBE;              // Les cases sur lesquels on est absorbé
                    } else {
                        if (grille[y][x].statut === DEVIE || typeof grille[y][x].nb === "number") grille[y][x].statut = REFLECHI;      // Réfléchi si deux champs se chevauchent ou si on n'est pas sur le plateau
                        if (grille[y][x].statut === VIDE) grille[y][x].statut = DEVIE;
                        
                    }
                }
            }
        }
        
        console.log("Grille créée.");
        return grille;
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