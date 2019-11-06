<template>
  <div>
    <Row>
      <Col span="12">
        <apexchart
          ref="memoryInfo"
          type="area"
          height="350"
          :options="memory.chartOptions"
          :series="memory.series"
        />
      </Col>
      <Col span="12">
        <apexchart
          ref="keySize"
          type="area"
          height="350"
          :options="key.chartOptions"
          :series="key.series"
        />
      </Col>
    </Row>
    <Row>
      <Divider orientation="left">Redis详细信息</Divider>
      <Table :columns="columns" :data="redisInfo" :show-header="false"></Table>
    </Row>
  </div>
</template>

<script>
import {
  apiRedisMemory,
  apiRedisKeySize,
  apiRedisInfo
} from '@/api/index'
export default {
  name: "monitor",
  data() {
    return {
      memory: {
        series: [],
        chartOptions: {
          chart: {
            animations: {
              enabled: true,
              easing: "linear",
              dynamicAnimation: {
                speed: 5000
              }
            },
            toolbar: {
              show: false
            },
            zoom: {
              enabled: false
            }
          },
          dataLabels: {
            enabled: false
          },
          stroke: {
            curve: "smooth"
          },
          title: {
            text: "Redis内存实时占用情况（KB）",
            align: "left"
          },
          markers: {
            size: 0
          },
          xaxis: {},
          yaxis: {},
          legend: {
            show: false
          }
        },
        data: [],
        xdata: []
      },
      key: {
        series: [],
        chartOptions: {
          chart: {
            animations: {
              enabled: true,
              easing: "linear",
              dynamicAnimation: {
                speed: 5000
              }
            },
            toolbar: {
              show: false
            },
            zoom: {
              enabled: false
            }
          },
          dataLabels: {
            enabled: false
          },
          colors: ["#f5564e"],
          stroke: {
            curve: "smooth"
          },
          title: {
            text: "Redis key实时数量（个）",
            align: "left"
          },
          markers: {
            size: 0
          },
          xaxis: {},
          yaxis: {},
          legend: {
            show: false
          }
        },
        data: [],
        xdata: []
      },
      columns: [
        {
          key: "key",
          minWidth: 200
        },
        {
          key: "description",
          minWidth: 500
        },
        {
          key: "value",
          width: 400
        }
      ],
      redisInfo: [],
      timer: null
    };
  },
  methods: {
    init() {
      this.getData();
      this.getInfo();
    },
    // 统计
    getData() {
      let minMemory = 1e10;
      let minSize = 1e10;
      let maxMemory = -1e10;
      let maxSize = -1e10;
      this.timer = setInterval(() => {
        // 内存
        apiRedisMemory().then(res => {
          let currentMemory = Number(res.data.data.memory) / 1024;
          // 更新最大最小值
          if (currentMemory < minMemory) {
            minMemory = currentMemory;
          }
          if (currentMemory > maxMemory) {
            maxMemory = currentMemory;
          }

          this.memory.data.push(Number(currentMemory.toFixed(2)));
          this.memory.xdata.push(res.data.data.time);
          // 5个点
          if (this.memory.data.length >= 6) {
            this.memory.data.shift();
            this.memory.xdata.shift();
          }
          // 更新点信息
          this.$refs.memoryInfo.updateSeries([
            {
              name: "内存(KB)",
              data: this.memory.data
            }
          ]);

          // 更新最大最小值
          this.$refs.memoryInfo.updateOptions(
            {
              xaxis: {
                categories: this.memory.xdata
              },
              yaxis: {
                min: minMemory - 2,
                max: maxMemory + 2
              }
            },
            true,
            true
          );
        });
        // 键值
        apiRedisKeySize().then(res => {
          let currentSize = res.data.data.keySize;
          // 更新最大最小值
          if (currentSize < minSize) {
            minSize = currentSize;
          }
          if (currentSize > maxSize) {
            maxSize = currentSize;
          }

          this.key.data.push(currentSize);
          this.key.xdata.push(res.data.data.time);
          // 5个点
          if (this.key.data.length >= 6) {
            this.key.data.shift();
            this.key.xdata.shift();
          }
          // 更新点信息
          this.$refs.keySize.updateSeries([
            {
              name: "key数量",
              data: this.key.data
            }
          ]);
          // 更新最大最小值
          this.$refs.keySize.updateOptions(
            {
              xaxis: {
                categories: this.key.xdata
              },
              // 避免最大最小值一致
              yaxis: {
                min: minSize - 2,
                max: maxSize + 2
              }
            },
            true,
            true
          );
        });
      }, 5000);
    },
    getInfo() {
      apiRedisInfo().then(res => {
        let data = [];
        res.data.data.forEach(e => {
          if (e.description) {
            data.push(e);
          }
        });
        this.redisInfo = data;
      });
    }
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  },
  mounted() {
    this.init();
  }
};
</script>
