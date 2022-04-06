//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Market {
  address public owner;
  mapping(address => bool) public operator;
  mapping(address => User) public users;

  struct User {
    string uid; //学号
    bool whiteList; //是否为白名单
    string name; //姓名
    string telephone; //电话
    string role;
    string sex;
    string introduce;
    string email;
    string like;
  }

  struct Order {
    uint256 id; //订单id
    address seller; //订单卖家
    address buyer; //订单买家
    uint256 amount; //订单价格
    string imgUrl; //商品图片
    string describe; //最大筹集人数
    string evaluate;
    uint256 status; //订单状态 0关闭 1上架 2完成
  }

  struct Advertisement {
    uint256 id; //订单id
    address publisher; //广告发布者
    uint256 time; //广告发布时间
    string imgUrl; //广告图片
    string describe; //广告描述
    uint256 status; //订单状态 0关闭 1审核中 2已上架
  }

  Advertisement[] public advertisements;
  Order[] public orders; //所有订单

  event NewOrder(uint256 id, address seller, uint256 amount, string imgUrl, string describe); //创建新订单
  event NewBuy(address buyer, uint256 oid, uint256 amount); //购买新订单
  event NewEvaluate(uint256 oid, string evaluate); //评价订单

  event NewAdvertisement(uint256 id, address publisher, uint256 time, string imgUrl, string describe); //创建广告

  event CloseOrder(uint256 pid); //终止订单项目
  event CloseAdvertisement(uint256 aid); //终止订单项目

  // 取消限制
  modifier onlyOwner() {
    require(true || msg.sender == owner, "You don't have permission");
    _;
  }

  // 取消限制
  modifier onlyOperator() {
    require(true || operator[msg.sender], "You don't have permission");
    _;
  }

  // 取消限制
  modifier onlyWhiteList() {
    require(true || users[msg.sender].whiteList, "You don't have permission");
    _;
  }

  constructor() {
    owner = msg.sender;
    operator[msg.sender] = true;
    users[msg.sender].whiteList = true;
  }

  function transferOwner(address _owner) public onlyOwner {
    owner = _owner;
  }

  function setOperator(address account, bool status) public onlyOwner {
    operator[account] = status;
  }

  function setWhiteList(address account, bool status) public onlyOperator {
    users[account].whiteList = status;
  }

  // 更新用户信息
  function updateUser(
    address account,
    string memory _role,
    string memory _sex,
    string memory _uid,
    string memory _introduce,
    string memory _name,
    string memory _telephone,
    string memory _like,
    string memory _email,
    bool _whiteList
  ) public onlyOperator returns (bool) {
    users[account] = User({ role: _role, uid: _uid, sex: _sex, introduce: _introduce, like: _like, whiteList: _whiteList, name: _name, email: _email, telephone: _telephone });
    return true;
  }

  // 添加项目
  function newOrder(
    uint256 _amount,
    string memory _imgUrl,
    string memory _describe
  ) public onlyWhiteList returns (bool) {
    uint256 id = orders.length;
    Order memory order = Order({ id: id, seller: msg.sender, buyer: address(0), amount: _amount, imgUrl: _imgUrl, describe: _describe, evaluate: '', status: 1 });
    orders.push(order);
    emit NewOrder(id, msg.sender, _amount, _imgUrl, _describe);
    return true;
  }

  // 添加广告
  function newAdvertisement(string memory _imgUrl, string memory _describe) public payable onlyWhiteList returns (bool) {
    uint256 id = advertisements.length;
    require(msg.value == 0.1 ether, 'Please enter the correct fee');
    Advertisement memory advertisement = Advertisement({ id: id, publisher: msg.sender, time: block.timestamp, imgUrl: _imgUrl, describe: _describe, status: 1 });
    advertisements.push(advertisement);
    emit NewAdvertisement(id, msg.sender, block.timestamp, _imgUrl, _describe);
    return true;
  }

  // 审核广告
  function auditAdvertisement(uint256 _aid, uint256 _status) public onlyOperator returns (bool) {
    Advertisement storage a = advertisements[_aid];
    require(a.status == 1, 'The advertisement can not be audit');
    a.status = _status;
    return true;
  }

  // 购买商品
  function buy(uint256 _oid) public payable onlyWhiteList returns (bool) {
    Order storage o = orders[_oid];
    require(msg.sender != o.seller, 'You can not buy your good');
    require(msg.value == o.amount, 'Abnormal price');
    require(o.status == 1, 'This order cannot be purchased');
    o.status = 2;
    o.buyer = msg.sender;
    payable(o.seller).transfer(msg.value);
    emit NewBuy(msg.sender, _oid, msg.value);
    return true;
  }

  function evaluateOrder(uint256 _oid, string memory _evaluate) public returns (bool) {
    Order storage o = orders[_oid];
    require(keccak256(abi.encodePacked(o.evaluate)) == keccak256(abi.encodePacked('')), 'The order has been evaluated');
    require(o.buyer == msg.sender, "You don't have permission");

    o.evaluate = _evaluate;
    emit NewEvaluate(_oid, _evaluate);
    return true;
  }

  // 关闭订单
  function closeOrder(uint256 _oid) public returns (bool) {
    Order storage o = orders[_oid];
    require(o.seller == msg.sender || operator[msg.sender], "You don't have permission");
    require(o.status == 1, 'Order can not be closed');
    o.status = 0;
    return true;
  }

  // 关闭广告
  function closeAdvertisement(uint256 _aid) public returns (bool) {
    Advertisement storage a = advertisements[_aid];
    require(a.publisher == msg.sender || operator[msg.sender], "You don't have permission");
    require(a.status == 1 || a.status == 2, 'Advertisement can not be closed');
    a.status = 0;
    return true;
  }

  // 总订单长度
  function orderLength() public view returns (uint256) {
    return orders.length;
  }

  // 总广告长度
  function advertisementLength() public view returns (uint256) {
    return advertisements.length;
  }
}
