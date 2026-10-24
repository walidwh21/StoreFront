export enum UserType {
  Admin = "admin",
  Member = "member"
}

export interface IUserCredentials {
  email: string;
  password: string;
}

export interface ISignUpCredentials extends IUserCredentials {
  fullName: string;
}

export interface NewUserForm {
  fullName: string;
  email: string;
  password: string;
  phone?: number;
  iban?: string;
  bankName?: string;
  userType?: UserType;
}

export class User {
  private userId: string;
  private fullName: string;
  private email: string;
  private phone: number;
  private iban: string;
  private bankName: string;
  private userType: UserType;

  constructor(
    data: any
  ) {
    this.userId = data.userId ?? '';
    this.fullName = data.fullName;
    this.email = data.email;
    this.phone = data.phone ?? null;
    this.iban = data.iban ?? '';
    this.bankName = data.bankName ?? '';
    this.userType = data.userType ?? UserType.Member;;
  }

  public getFullName(): string {
    return this.fullName;
  }

  public greetUser(): string {
    switch (this.userType) {
      case UserType.Admin:
        return `Welcome Admin ${this.fullName}, you have full access.`;
      case UserType.Member:
        return `Welcome Member ${this.fullName}, enjoy your shopping.`;
      default:
        return `Welcome Guest, feel free to explore.`;
    }
  }

  public getUserId(): string {
    return this.userId;
  }

  public setUserId(userId: string): void {
    this.userId = userId;
  }

  public setFullName(fullName: string): void {
    this.fullName = fullName;
  }

  public getEmail(): string {
    return this.email;
  }

  public setEmail(email: string): void {
    this.email = email;
  }

  public getPhone(): number {
    return this.phone;
  }

  public setPhone(phone: number): void {
    this.phone = phone;
  }

  public getIban(): string {
    return this.iban;
  }

  public setIban(iban: string): void {
    this.iban = iban;
  }

  public getBankName(): string {
    return this.bankName;
  }

  public setBankName(bankName: string): void {
    this.bankName = bankName;
  }

  public getUserType(): UserType {
    return this.userType;
  }

  public setUserType(userType: UserType): void {
    this.userType = userType;
  }

  public static fromJSON(data: any): User {
    return new User(data);
  }

  public toJSON(): any {
    return {
      userId: this.userId,
      fullName: this.fullName,
      email: this.email,
      phone: this.phone,
      iban: this.iban,
      bankName: this.bankName,
      userType: this.userType
    };
  }
}
