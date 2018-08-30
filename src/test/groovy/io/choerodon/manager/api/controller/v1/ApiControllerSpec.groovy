package io.choerodon.manager.api.controller.v1

import io.choerodon.manager.IntegrationTestConfiguration
import io.choerodon.manager.domain.manager.entity.RouteE
import io.choerodon.manager.domain.repository.RouteRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.web.client.TestRestTemplate
import org.springframework.context.annotation.Import
import spock.lang.Specification

import static org.springframework.boot.test.context.SpringBootTest.WebEnvironment.RANDOM_PORT

/**
 * @author superlee
 */
@SpringBootTest(webEnvironment = RANDOM_PORT)
@Import(IntegrationTestConfiguration)
class ApiControllerSpec extends Specification {
    @Autowired
    RouteRepository routeRepository
    @Autowired
    private TestRestTemplate restTemplate

    def "Resources"() {
        given: 'mock RouteRepository的getAllRoute()'
        routeRepository.getAllRoute() >> new ArrayList<RouteE>()
        when: "发送一个get请求"
        def entity = restTemplate.getForEntity("/v1/swaggers/resources", String)

        then: "请求通过"
        entity.statusCode.is2xxSuccessful()
    }

    def "QueryByNameAndVersion"() {

        when: "发送请求"
        def entity = restTemplate.getForEntity("/v1/swaggers/manager/controllers", String)

        then: "状态码200，调用成功"
        entity.statusCode.is2xxSuccessful()

    }

    def "QueryPathDetail"() {
        given: '准备参数'
        def version = 'test_version'
        def operationId = '1'
        when: "发送请求"
        def entity = restTemplate.getForEntity("/v1/swaggers/manager/controllers/ApiController/paths?version={version}&operation_id={operationId}", String, version, operationId)

        then: "状态码200，调用成功"
        entity.statusCode.is2xxSuccessful()
    }
}
