var year = new Date().getFullYear();
const gen = new GeneralStats();


$(document).ready(function () {
    new UtilsStats().updateYearsDropdown($(document).find('#invStats'), year);
    new UtilsStats().updateYearsDropdown($(document).find('#accountingStats'), year);
    new UtilsStats().updateYearsDropdown($(document).find("#lowStockStats"), year);


    gen.inventoryGraphMassiveSales($(document).find('#invStats'));
    gen.accountingGraphSalesPayment($(document).find('#accountingStats'));
    gen.summarySystemInfo($(document).find("#apiStats"));
    gen.summaryCards($(document).find("#cardsStats"));
    gen.inventoryItemCriticalMassiveSales($(document).find("#lowStockStats"));

    $(document).on('change', '#invStats #yearStats', function () { 
        gen.inventoryGraphMassiveSales($(document).find('#invStats'));
    });
    $(document).on('change', '#accountingStats #yearStats', function () { 
        gen.accountingGraphSalesPayment($(document).find('#accountingStats'));
    });
    $(document).on('change', '#lowStockStats #yearStats', function () { 
        gen.inventoryItemCriticalMassiveSales($(document).find("#lowStockStats"));
    });
});