(function () {
    'use strict';

    angular
        .module('app')
        .component('buyModal', {
            templateUrl: 'app-components/buy-modal/buyModal.html',
            bindings: {
                modalInstance: "<",
                resolve: "<"
            },
            controller: BuyModalController
        });

    BuyModalController.$inject = ['UserService', 'FlashService', 'blockUI']

    function BuyModalController(UserService, FlashService, blockUI) {
        var vm = this;

        vm.user = null;
        vm.modalData = null;
        vm.summary = null;
        vm.close = close;
        vm.dismiss = dismiss;
        vm.buyCurrency = buyCurrency;
        vm.updateCurrencyCount = updateCurrencyCount;

        vm.$onInit = init;

        function init() {
            vm.modalData = vm.resolve.modalData;

            UserService.GetCurrent()
                .then(function (user) {
                    vm.user = user;
                    blockUI.stop();
                })
                .catch(function (err) {
                    console.log(err)
                    blockUI.start();
                });
        }

        function updateCurrencyCount() {
            if (vm.modalData.unit > 1) {
                vm.summary = (vm.modalData.count / vm.modalData.unit) * vm.modalData.purchasePrice;
            } else {
                vm.summary = vm.modalData.count * vm.modalData.purchasePrice;
            }

            (((vm.user.cantor[vm.modalData.code.toLowerCase()] - vm.modalData.count) < 0) || (vm.summary > vm.user.value)) ?
                vm.isDisabled = true :
                vm.isDisabled = false;
        }

        function buyCurrency() {
            vm.user.value = vm.user.value - vm.summary;
            vm.user.user[vm.modalData.code.toLowerCase()] = vm.user.user[vm.modalData.code.toLowerCase()] + vm.modalData.count;
            vm.user.cantor[vm.modalData.code.toLowerCase()] = vm.user.cantor[vm.modalData.code.toLowerCase()] - vm.modalData.count;

            UserService.Update(vm.user)
                .then(function () {
                    FlashService.Success('User updated');
                    vm.modalInstance.close()
                })
                .catch(function (error) {
                    FlashService.Error(error);
                });
        }

        function close() {
            blockUI.stop();
            vm.modalInstance.close(vm.modalData);
        }

        function dismiss() {
            vm.modalInstance.dismiss('cancel');
        }
    }
})();