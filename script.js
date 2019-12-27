const VIDE = 0, DEVIE = 1, REFLECHI = 2, ABSORBE = 3, ATOME = 4;

class BlackBox {
    constructor(L, l, nbAtomes){
        this.L = L, this.l = l, this.nbAtomes = nbAtomes;
        this.creerGrille(this.L, this.l);
        this.atomesAleatoires(this.nbAtomes);
        console.log("Le jeu peut commencer.");
    }
    
    creerGrille(L, l){
        /* Création du plateau */
        this.grille = Array(l+2).fill().map(e=>Array(L+2).fill().map(e=>{return {statut: VIDE};})); // Génère une grille avec un contour
        this.tour = {};     // Tableau associant le numéro d'une case périphérique avec ses coordonées
        for (let c=1; c <= (L+l)*2; c++){
            if (c<=l){                          // Bord gauche
                this.grille[c][0].num = c;
                this.tour[c] = new Rayon(0, c, 1, 0);
            } else if (c <= l+L){                 // Bas
                this.grille[l+1][c-l].num = c;
                this.tour[c] = new Rayon(c-l, l+1, 0, -1);
            } else if (c <= l+L+l){               // Bord droit
                this.grille[l-(c-l-L)+1][L+1].num = c;
                this.tour[c] = new Rayon(L+1, l-(c-l-L)+1, -1, 0);
            } else {                            // Haut
                this.grille[0][L-(c-l-L-l)+1].num = c;
                this.tour[c] = new Rayon(L-(c-l-L-l)+1, 0, 0, 1);
            }
        }
        this.grille[0][0].num = 0, this.grille[l+1][0].num = 0, this.grille[l+1][L+1].num = 0, this.grille[0][L+1].num = 0; // On ne peut pas aller derrière les coins
    }
    
    atomesAleatoires(nbAtomes){
        /* Placement des atomes */
        for (let i=0; i<nbAtomes; i++){
            const vides = [];
            for (let y=1; y<this.l+1; y++) for (let x=1; x<this.L+1; x++) if (this.grille[y][x].statut !== ATOME) vides.push({x:x, y:y});     // Toutes les cases où il n'y a pas d'atomes
            const nouvelAtome = vides[Math.floor(Math.random()*vides.length)];
            this.grille[nouvelAtome.y][nouvelAtome.x].statut = ATOME;
            for (let x = nouvelAtome.x-1; x <= nouvelAtome.x+1; x++) for (let y = nouvelAtome.y-1; y <= nouvelAtome.y+1; y++) if (this.grille[y][x].statut !== ATOME) {     // Champ de l'atome
                if (x === nouvelAtome.x || y === nouvelAtome.y){
                    this.grille[y][x].statut = ABSORBE;              // Les cases sur lesquelles on est absorbé
                } else {
                    // Réfléchi si deux champs se chevauchent ou si on n'est pas sur le plateau, dévié sinon
                    if (this.grille[y][x].statut === DEVIE || this.grille[y][x].num !== undefined) this.grille[y][x].statut = REFLECHI;
                    if (this.grille[y][x].statut === VIDE) this.grille[y][x].statut = DEVIE;
                }
            }
        }
    }
    
    coup(num){
        let {x, y, deplacementX, deplacementY} = this.tour[num];
        do {
            console.log(x, y);
            switch (this.grille[y][x].statut){          // Instructions selon le statut de la case
                case VIDE:
                    break;
                case DEVIE:
                    if (deplacementY === 0){                                        // Déplacement d'incidence horizontal
                        deplacementY = (this.grille[y-1][x].statut === ABSORBE)? 1: -1;
                        deplacementX = 0;
                        break;
                    } else {
                        deplacementX = (this.grille[y][x-1].statut === ABSORBE)? 1: -1;
                        deplacementY = 0;
                        break;
                    }
                case REFLECHI:
                    return num;
                    break;
                case ABSORBE:
                    return 0;
                    break;
            }
            x+= deplacementX;
            y+= deplacementY;
        } while (this.grille[y][x].num === undefined)
        return this.grille[y][x].num;
    }
}

class Rayon {        
    constructor(x, y, deplacementX, deplacementY){
        this.x = x, this.y = y;
        this.deplacementX = deplacementX, this.deplacementY = deplacementY;
    }
}

// Débogage

function afficherGrille(g){
    let html = "<table>"
    for (let y in g) {
        html+="<tr>";
        for (let x in g[y]){
            let contenu;
            if (g[y][x].num !== undefined) {
                contenu = g[y][x].num;
            } else if (g[y][x].statut === ATOME){
                contenu = "x";
            } else {
                contenu = "";
            }
            html+=`<td class="${(g[y][x].num !== undefined)? "gris": ""}">`+contenu+"</td>";
        }
        html+="</tr>";
    }
    html+= "</table>";
    document.body.innerHTML = html;
}

const bb = new BlackBox(4,4, 2);
afficherGrille(bb.grille);