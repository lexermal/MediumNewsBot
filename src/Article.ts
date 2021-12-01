class Article {
    private id: string;
    private title: string;
    private link: string;
    private previewText: string;
    private creator: string;
    private pubDate: string;
    private categories: string[];


    constructor($id: string, $title: string, $link: string, $previewText: string, $creator: string, $pubDate: string) {
        this.id = $id;
        this.title = $title;
        this.link = $link;
        this.previewText = $previewText;
        this.creator = $creator;
        this.pubDate = $pubDate;
    }

    public setCategories(categories: string[]) {
        this.categories = categories;
    }


    /**
     * Getter $link
     * @return {string}
     */
	public get $link(): string {
		return this.link;
	}


}