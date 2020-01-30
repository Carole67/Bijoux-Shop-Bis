export class User {
    
    public constructor(
        public civility: string,
        public firstName: string,
        public lastName: string,
        public address: string,
        public zipCode: number,
        public city: string,
        public country: string,
        public phone: number,
        public phoneFormated: string,
        public mail: string,
        public login: string,
        public password: string) {
    }

    public static fromJson(json: Object): User {
        return new User(
            json['civility'],
            json['firstName'],
            json['lastName'],
            json['address'],
            json['zipCode'],
            json['city'],
            json['country'],            
            json['phone'],
            json['phoneFormated'],
            json['mail'],
            json['login'],
            json['password']
        );
    }
}