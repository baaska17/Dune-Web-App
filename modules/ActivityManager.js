/**
 * ActivityManager Module
 * Manages loading, filtering, transforming, and rendering activity data.
 */

export class ActivityManager {
    constructor(jsonUrl) {
        this.jsonUrl = jsonUrl;
        this.activities = [];
    }

    // fetch ашиглан JSON өгөгдлийг серверээс татна
    async load() {
        const response = await fetch(this.jsonUrl);
        if (!response.ok) throw new Error(`Failed to load: ${this.jsonUrl}`);
        this.activities = await response.json();
        return this;
    }

    // filter — зөвхөн featured үйл ажиллагааг авна
    getFeatured() {
        return this.activities.filter(activity => activity.featured);
    }

    // filter — ангилалаар шүүнэ
    getByCategory(category) {
        return this.activities.filter(activity => activity.category === category);
    }

    // reduce — нийт үнэ болон дундаж үнэ тооцоолно
    getStats() {
        const total = this.activities.reduce((sum, activity) => sum + activity.price, 0);
        const avgRating = this.activities.reduce((sum, a) => sum + a.rating, 0) / this.activities.length;
        return {
            count: this.activities.length,
            totalPrice: total,
            avgPrice: (total / this.activities.length).toFixed(0),
            avgRating: avgRating.toFixed(1)
        };
    }

    // map + flat + filter + join — бүх өвөрмөц тэгийг нэгтгэнэ
    getAllTagsString() {
        return this.activities
            .map(activity => activity.tags)
            .flat()
            .filter((tag, index, arr) => arr.indexOf(tag) === index)
            .join(' • ');
    }

    // map + join — картуудыг HTML болгон хөрвүүлж DOM-д оруулна
    render(container, activities = null) {
        const items = activities ?? this.activities;

        if (items.length === 0) {
            container.innerHTML = `<p class="no-results">No activities found.</p>`;
            return;
        }

        container.innerHTML = items.map(item => `
            <article class="activity-card">
                <img src="${item.image}" alt="${item.title}" />
                <div class="activity-info">
                    <h4>${item.title}</h4>
                    <p>${item.description}</p>
                    <div class="activity-footer">
                        <a href="${item.link}" class="btn-gold">Discover ›</a>
                    </div>
                </div>
            </article>
        `).join('');
    }

    // DOM-д статистик мэдээллийг харуулна
    renderStats(container) {
        const stats = this.getStats();
        const tags = this.getAllTagsString();
        container.innerHTML = `
            <div class="stats-bar">
                <span><strong>${stats.count}</strong> experiences</span>
                <span>avg <strong>$${stats.avgPrice}</strong>/person</span>
                <span>avg rating <strong>★ ${stats.avgRating}</strong></span>
                <span class="stats-tags">${tags}</span>
            </div>
        `;
    }
}
