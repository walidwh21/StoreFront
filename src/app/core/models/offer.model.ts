export type OfferType = 'special offer' | 'promotion' | 'discount';

export class Offer {
  private id: string | null;
  private title: string;
  private description: string;
  private discountPercent: number;
  private startDate: Date;
  private endDate: Date;
  private active: boolean;
  private type: OfferType;
  private productIds: string[];

  constructor(
    id: string | null,
    title: string,
    description: string,
    discountPercent: number,
    startDate: Date,
    endDate: Date,
    active: boolean,
    type: OfferType,
    productIds: string[]
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.discountPercent = discountPercent;
    this.startDate = startDate;
    this.endDate = endDate;
    this.active = active;
    this.type = type;
    this.productIds = productIds;
  }

  // --- Getters ---
  getId(): string | null {
    return this.id;
  }

  getTitle(): string {
    return this.title;
  }

  getDescription(): string {
    return this.description;
  }

  getDiscountPercent(): number {
    return this.discountPercent;
  }

  getStartDate(): Date {
    return this.startDate;
  }

  getEndDate(): Date {
    return this.endDate;
  }

  isActive(): boolean {
    return this.active;
  }

  getType(): OfferType {
    return this.type;
  }

  getProductIds(): string[] {
    return this.productIds;
  }

  // --- Setters ---
  setId(id: string | null): void {
    this.id = id;
  }

  setTitle(title: string): void {
    this.title = title;
  }

  setDescription(description: string): void {
    this.description = description;
  }

  setDiscountPercent(discountPercent: number): void {
    this.discountPercent = discountPercent;
  }

  setStartDate(startDate: Date): void {
    this.startDate = startDate;
  }

  setEndDate(endDate: Date): void {
    this.endDate = endDate;
  }

  setActive(active: boolean): void {
    this.active = active;
  }

  setType(type: OfferType): void {
    this.type = type;
  }

  setProductIds(productIds: string[]): void {
    this.productIds = productIds;
  }

  // --- Logic ---
  appliesToProduct(productId: string): boolean {
    return this.productIds.includes(productId);
  }

  isActiveNow(): boolean {
    const now = new Date();
    return this.active && now >= this.startDate && now <= this.endDate;
  }

  // --- Serialisation ---
  static fromJSON(data: any): Offer {
    return new Offer(
      data.id || null,
      data.title,
      data.description,
      data.discountPercent,
      new Date(data.startDate),
      new Date(data.endDate),
      data.active,
      data.type,
      data.productIds || []
    );
  }

  toJSON(): any {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      discountPercent: this.discountPercent,
      startDate: this.startDate.toISOString(),
      endDate: this.endDate.toISOString(),
      active: this.active,
      type: this.type,
      productIds: this.productIds
    };
  }
}
