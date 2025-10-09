export class BaseApiConfig {
    constructor({ usePathParams = "false", idQueryParamKey = 'id'} ) {
        this.usePathParams = usePathParams;
        this.idQueryParamKey = idQueryParamKey;
    }
}