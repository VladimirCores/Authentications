class HeaderVO {
  constructor(tokenVO) {
    this.tokenVO = tokenVO;
  }
  get forCouchDB() {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', `${this.tokenVO.token_type} ${this.tokenVO.id_token}`);
    return headers;
  }
}

export default HeaderVO;
