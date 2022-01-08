/**
 * 封装数据库工具类
 */
class DatabaseUtil {
    /**
     * 构造方法
     * @param sqlSentence 数据库语句
     * @param params 数据库操作的参数
     */
    constructor(sqlSentence, ...params) {
        this.sqlSentence = sqlSentence;
        this.params = params;
    }

    //获取当前实例
    static getInstance(sqlSentence, ...params) {
        return new DatabaseUtil(sqlSentence, ...params)
    }

    /**
     * 执行数据库操作
     * @param callback  成功的回调
     * @param errorCallback 失败的回调
     */
    execute(callback, errorCallback) {
        db.transaction(tx => {
            tx.executeSql(this.sqlSentence, this.params, callback, errorCallback)
        })
    }
}

export default DatabaseUtil
