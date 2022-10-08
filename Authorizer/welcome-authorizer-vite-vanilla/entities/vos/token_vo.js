class TokenVO {
  constructor(data) {
    this.access_token = data.access_token;
    this.expired = data.expires_in;
    this.roles = data.roles;
    this.scope = data.scope;
    this.id_token = data.id_token;
    this.token_type = data.token_type;
  }
  get isValid() {
    return !!this.access_token;
  }
  get auth() {
    return { Authorization: `${this.token_type} ${this.access_token}` };
  }
}

export default TokenVO;
