# Manager Service
本服务是猪齿鱼微服务框架的服务管理中心，主要功能包括配置管理，路由管理，和swagger管理


## 依赖

- mysql: 5.6+
- redis: 3.0+


## 安装和运行
* d1 在mysql数据库中创建`manager_service`数据库,并在该数据库执行下面的SQL语句来创建choerodon用户，并赋予权限。  
```sql 
CREATE USER 'choerodon'@'%' IDENTIFIED BY "123456"; 
CREATE DATABASE manager_service DEFAULT CHARACTER SET utf8; 
GRANT ALL PRIVILEGES ON manager_service.* TO choerodon@'%'; 
FLUSH PRIVILEGES;
```   
* 在`manager_service`项目的根文件目录下创建`init-local-database.sh` 脚本,并写入下面的代码。
```sh
mkdir -p target
if [ ! -f target/choerodon-tool-liquibase.jar ]
then
    curl http://nexus.choerodon.com.cn/repository/choerodon-release/io/choerodon/choerodon-tool-liquibase/0.6.0.RELEASE/choerodon-tool-liquibase-0.6.0.RELEASE.jar -o target/choerodon-tool-liquibase.jar
fi
java -Dspring.datasource.url="jdbc:mysql://localhost/manager_service?useUnicode=true&characterEncoding=utf-8&useSSL=false" \
 -Dspring.datasource.username=choerodon \
 -Dspring.datasource.password=123456 \
 -Ddata.drop=false -Ddata.init=true \
 -Ddata.dir=src/main/resources \
 -jar target/choerodon-tool-liquibase.jar
```
* 在`manager_service`根文件目录下执行上述创建的`init-local-database.sh`文件
```sh
sh init-local-database.sh
```
* 运行`manager_service`程序
```sh
mvn spring-boot:run
```

## 链接
* [修改日志](./CHANGELOG.zh-CN.md)

## 用法
1. 对于`Configuration management`: 
 * 该服务可以提供配置的new，update和delete操作
 * 可以使用json，yml或properties的文件格式
 * 可以为一个配置版本创建或者修改配置项
 * 在更新配置后，可以通知`config-server`服务，从而让与之对应的服务拉去新的配置信息
2. 对于`Route Management`
 * 可以通过初始化`api-gateway`服务的配置信息来获取初始路由
 * 可以创建和编辑路由
 * 在修改路由后，可以通知`config-server`服务并让`api-gateway`服务重新拉出路由

## 如何提交修改

如果你也想参与这个项目的开发和修改， [点击](https://github.com/choerodon/choerodon/blob/master/CONTRIBUTING.md) 去了解如何参与