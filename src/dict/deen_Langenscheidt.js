/* global api */
class deen_Langenscheidt {

    constructor(options) {
        this.options = options;
        this.maxexample = 2;
        this.word = '';
    }

    async displayName() {
        let locale = await api.locale();
        if (locale.indexOf('CN') != -1) return 'Langenscheidt德英词典';
        if (locale.indexOf('TW') != -1) return 'Langenscheidt德英词典';
        return 'Langenscheidt DE->EN Dictionary';
    }

    setOptions(options) {
        this.options = options;
        this.maxexample = options.maxexample;
    }

    async findTerm(word) {
        this.word = word;
        return await this.findLangenscheidt(word);
    }

    async findLangenscheidt(word) {
        let classesToRemove = [
            'source-section',
            'synonym-entry',
            'source-info',
            'senses',
            'ad-content-acc-crpexa-1-1',
            'subline',
            'headline',
            'example-trans',
            'title',
            'source-notice',
            'context',
            'lemma-pos-title',
            'lemma-title'
        ];

        let idsToRemove = [
            'breadcrumb',
            'ad-content-end',
            'tab-examples-1-1'
        ];

        let tagsToRemove = [
            'svg',
            'input',
            'h2'
        ];

        let addLineBreak = [
            'additional-entry',
            'round'
        ];

        let content = '';
        let firstEntry = '';
        let combinedContent = '';

        if (!word) return null;

        let base = 'https://en.langenscheidt.com/german-english/';
        let url = base + encodeURIComponent(word);
        let doc = '';

        try {
            let data = await api.fetch(url);
            let parser = new DOMParser();
            doc = parser.parseFromString(data, 'text/html');
        } catch (err) {
            return null;
        }

        //take the first entry incase Langenscheit gets confused and gives you multiple entrys
        let check = doc.querySelector('#did-you-mean');
        if(check) {
            firstEntry = doc.querySelector('.lemma-group') || '';
            content = firstEntry.querySelector('.tab-inner-content') || '';

            let css = this.renderCSS();
            return css + content.innerHTML;
        }

        content = doc.querySelectorAll('#inner-content') || '';

        let tag = '';

        tagsToRemove.forEach((element) => {
            tag = doc.getElementsByTagName(element);
            for(let i=0; i<tag.length; i++){
                tag[i].remove();
            }
        });

        //get rid of unnecessary filler material in definition
        let junk = '';
        classesToRemove.forEach((element) => {
            junk = doc.querySelectorAll('.' + element);
            junk.forEach((element, index) => {
                junk[index].textContent = '';
            });
        });

        idsToRemove.forEach((element) => {
            junk = doc.querySelectorAll('#' + element);
            junk.forEach((element, index) => {
                junk[index].textContent = '';
            });
        });

        //separate sections by linebreak to increase readability
        addLineBreak.map(element => doc
          .querySelectorAll(element)
          .map(element => this.insertAdjacentHTML('afterend', '<br />'))
        );

        content.forEach((element, index) => {
            combinedContent += content[index].innerHTML;
        });

        let css = this.renderCSS();

        return css + combinedContent;
    }

    renderCSS() {
        let css = `
            <style>
                input {
                    display: none;
                }
            </style>`;

        return css;
    }
}
