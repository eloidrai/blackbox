/*******Partie algo*******/

const VIDE = 0, DEVIE = 1, REFLECHI = 2, ABSORBE = 3, ATOME = 4;

class BlackBox {
    constructor(L, l, nbAtomes){
        this.L = L, this.l = l, this.nbAtomes = nbAtomes;
        this.creerGrille(this.L, this.l);
        this.nbEssais = 0;
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
        for (const c of [{y:0, x:0}, {y:l+1, x:0}, {y:l+1, x:L+1}, {y:0, x:L+1}]){  // Bords
            this.grille[c.y][c.x].num = 0;
        }
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
        this.nbEssais++;
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
        } while (this.grille[y][x].num === undefined)       // Tant qu'on n'est pas sur un bord
        return this.grille[y][x].num;
    }
}

class Rayon {        
    constructor(x, y, deplacementX, deplacementY){
        this.x = x, this.y = y;
        this.deplacementX = deplacementX, this.deplacementY = deplacementY;
    }
}


/*******Partie interface*******/
const plateau = document.getElementById("plateau");

class Interface {
    constructor(L, l, nbAtomes){
        this.jeu = new BlackBox(L, l, nbAtomes)
        plateau.innerHTML = "";
        this.file = [];                         // File contenant les cases choisies
        this.tailleFile = nbAtomes;
        this.n_iemeCouleur = 1;
        for (let ligne=0; ligne<l+2; ligne++){
            const r = plateau.insertRow(-1);
            for (let cellule=0; cellule<L+2; cellule++){
                const c = r.insertCell(-1);
                plateau.rows[ligne].cells[cellule].innerHTML = `<div></div>`;
            }
        }
        for (const c in this.jeu.tour){
            plateau.rows[this.jeu.tour[c].y].cells[this.jeu.tour[c].x].innerHTML = `<span>${c}</span>`;
            plateau.rows[this.jeu.tour[c].y].cells[this.jeu.tour[c].x].classList.add("contour");
        }
        for (const c of [{y:0, x:0}, {y:l+1, x:0}, {y:l+1, x:L+1}, {y:0, x:L+1}]){
            plateau.rows[c.y].cells[c.x].classList.add("contour");
            plateau.rows[c.y].cells[c.x].classList.add("coin");
        }
        this.initEvenements();
    }
    
    clicCaseNumerote(e, num){
        const resultat = this.jeu.coup(num);
        if (resultat===0){
            e.classList.add("abs");
        } else if (resultat===num) {
            e.classList.add("ref");
        } else {
            const elementResultat = plateau.rows[this.jeu.tour[resultat].y].cells[this.jeu.tour[resultat].x];
            e.classList.add("c"+this.n_iemeCouleur);
            elementResultat.classList.add("c"+this.n_iemeCouleur++);
        }
    }
    
    clicCaseInterieure(e){
        const ind = this.file.indexOf(e);
        if (ind===-1){         // Si la case n'est encore choisie
            e.classList.add("affiche");
            this.file.push(e);
            if (this.file.length > this.tailleFile){
                this.file[0].classList.remove("affiche");
                this.file.shift();
            }
        } else { 
            this.file[ind].classList.remove("affiche");
            this.file.splice(ind, 1);
        }
    }
    
    initEvenements() {
        document.querySelectorAll("#plateau td:not(.coin)").forEach(element=>{
            element.addEventListener('click', e=>{
                const cellule = (e.target.tagName==="TD")? e.target: e.target.parentElement;    // Récupère TOUJOURS l'élément cellule
                if (cellule.classList.contains("contour")){ // Cases du contour
                     this.clicCaseNumerote(cellule, parseInt(cellule.children[0].innerHTML));
                } else {
                    this.clicCaseInterieure(cellule);
                }
            });
        });
    }
}

const i = new Interface(8,8,4);

